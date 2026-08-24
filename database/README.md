# Database CLI

This project provides PostgreSQL command-line tools for selecting an
environment, applying migrations, seeding data, and resetting a database.

The reusable TypeScript implementation lives in `engine/`. Environment files,
migrations, and seeds live in the fixed `workingDir/` folder.

Users extend the database schema or change local database configuration by
adding, removing, or editing files in `workingDir/`. The files in `engine/` are
internal implementation and normally do not need to be changed.

## Directory structure

The engine and runtime files are intentionally separated:

```text
Database/
├── engine/
│   ├── lib/
│   │   ├── migration.ts
│   │   └── transaction.ts
│   ├── scripts/
│   │   ├── database.ts
│   │   ├── migrate.ts
│   │   ├── seed.ts
│   │   └── reset.ts
│   ├── templates/
│   │   ├── logger.ts
│   │   └── selectTheme.ts
│   ├── types/
│   │   └── environment.ts
│   └── utils/
│       ├── assertEnvironmentAllowed.ts
│       ├── connectDb.ts
│       └── loadEnv.ts
├── workingDir/
│   ├── env/
│   │   ├── .env.example
│   │   ├── .env.development      # Local only
│   │   ├── .env.test             # Local only
│   │   └── .env.production       # Local only
│   ├── migrations/
│   │   ├── 000_extensions.sql
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_sessions.sql
│   │   └── xxx_example.sql        # Optional example file, ignored by the runner
│   └── seeds/
│       ├── development_seed.sql  # Local only
│       ├── test_seed.sql         # Local only
│       └── custom_seed.sql       # Local only
├── index.ts
├── package.json
└── README.md
```

`Database` is the project root where `npm start` is executed. `workingDir` is a
literal child folder named `workingDir`, not another name for the command's
current directory. Files marked `Local only` may contain credentials or private
seed data and should not be committed.

## Install dependencies

```bash
npm install @inquirer/prompts chalk dotenv pg
npm install --save-dev @types/node @types/pg tsx typescript
```

Run these commands from `Database`. Skip packages that are already installed.

## Create environment files

The CLI reads environment files from `workingDir/env/`.

Create the runtime directories and required local files:

```bash
mkdir -p workingDir/env workingDir/migrations workingDir/seeds
cp workingDir/env/.env.example workingDir/env/.env.development
cp workingDir/env/.env.example workingDir/env/.env.test
cp workingDir/env/.env.example workingDir/env/.env.production
```

Each file must define both `NODE_ENV` and `DATABASE_URL`. The value of
`NODE_ENV` must match the filename.

`workingDir/env/.env.development`:

```dotenv
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/app_development
```

`workingDir/env/.env.test`:

```dotenv
NODE_ENV=test
DATABASE_URL=postgresql://user:password@localhost:5432/app_test
```

`workingDir/env/.env.production`:

```dotenv
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/app_production
```

The `custom` environment does not use an environment file. The CLI asks for a
`DATABASE_URL` at runtime.

## Create seed files

Seed files are optional and belong to `workingDir/seeds/`. The default filename
is based on the selected environment:

```text
workingDir/seeds/development_seed.sql
workingDir/seeds/test_seed.sql
workingDir/seeds/custom_seed.sql
```

Example `workingDir/seeds/development_seed.sql`:

```sql
INSERT INTO users (
  username,
  email,
  password_hash,
  role
)
VALUES (
  'local_admin',
  'admin@example.test',
  'replace-with-a-valid-password-hash',
  'admin'
);
```

Do not use real credentials or production user data in seed files.

When `Seed` is selected, `database.ts` first looks for
`workingDir/seeds/{environment}_seed.sql`:

- If the file exists, it is used automatically.
- If the file does not exist, the CLI asks whether another seed file should be
  provided.
- Selecting `No` cancels the seed action and returns to the action menu.
- Selecting `Yes` asks for a local path to a `.sql` file.
- A relative path entered manually is resolved from `Database`, because the CLI
  is started there with `npm start`.
- An empty, missing, or non-`.sql` path produces an error and exits the CLI.

## Quick start for contributors

1. Install dependencies from the project root:

```bash
npm install
```

2. Ensure the working folders exist:

```bash
mkdir -p workingDir/env workingDir/migrations workingDir/seeds
```

3. Copy the example environment file for your local environments:

```bash
cp workingDir/env/.env.example workingDir/env/.env.development
cp workingDir/env/.env.example workingDir/env/.env.test
```

4. Update each `.env.*` file with your local database URL.

5. Start the CLI:

```bash
npm start
```

6. Select an environment and run one of the actions from the menu.

## Create migrations

Migration files belong to `workingDir/migrations/` and must follow this format:

```text
NNN_lowercase_name.sql
```

Examples:

```text
000_extensions.sql
001_create_users.sql
002_create_sessions.sql
003_add_user_profiles.sql
```

Rules:

- Versions contain exactly three digits.
- Versions start at `000` and must be contiguous.
- Names may contain lowercase letters, numbers, and underscores.
- Every version must be unique.
- Migration files must be committed.
- Never rename or modify a migration after it has been applied. The CLI stores
  its name and SHA-256 checksum in `schema_migrations`.
- Add a new migration when the schema needs to change.

### Example file kept for reference

If you want to keep a sample SQL file in the migrations folder without having it
executed by the runner, use a filename that is intentionally ignored by the CLI,
for example `xxx_example.sql`.

This file is useful for documentation or onboarding, but it is not treated as a
real migration because it does not match the required `NNN_name.sql` pattern.

Do not create real migrations with names like `example.sql`, `draft.sql`, or
`xxx_example.sql`. Real migrations must always use the numbered format.

## Run the CLI

Define the root package script if it does not already exist:

```json
{
  "scripts": {
    "start": "tsx index.ts"
  }
}
```

Run the CLI from `Database`:

```bash
cd /path/to/Database
npm start
```

Do not run the command from inside `workingDir/`.

The CLI first asks for an environment and then displays the action menu:

```text
1. Migrate
2. Seed
3. Reset
4. Switch Environment
5. Exit
```

## Action policies

| Action | Development | Test | Production | Custom |
| --- | --- | --- | --- | --- |
| Migrate | Allowed | Allowed | Allowed | Allowed |
| Seed | Allowed | Allowed | Blocked | Allowed |
| Reset | Allowed | Allowed | Blocked | Allowed |

Selecting `Production` displays a warning and requires explicit confirmation.
`No` is the default choice.

### Migrate

`Migrate` creates `schema_migrations` when necessary, validates the local
migration sequence, checks previously applied checksums, and applies each
pending migration in its own transaction.

### Seed

`Seed` verifies that all migrations are up to date, reads the selected seed
file, and executes it in a transaction. A failed seed is rolled back.

### Reset

`Reset` drops and recreates the `public` schema, then reapplies every migration.
The complete reset runs in one transaction, so a failure rolls the operation
back. This action is destructive and is blocked in `production`.

## Recommended `.gitignore`

```gitignore
# Local database environments
workingDir/env/.env.*
!workingDir/env/.env.example

# Private seed data anywhere in the repository
*_seed.sql
```

Because the seed pattern does not contain `/`, Git applies it to matching
filenames in every directory.

Keep the empty seed directory in Git when no seed files are committed:

```bash
touch workingDir/seeds/.gitkeep
```

Do not ignore `workingDir/migrations/*.sql`.

## Troubleshooting

### Environment file was not found

Confirm that the selected file exists under `workingDir/env/`, for example
`workingDir/env/.env.development`.

### NODE_ENV does not match

Make sure the value inside the file matches its suffix. For example,
`workingDir/env/.env.test` must contain `NODE_ENV=test`.

### Migration sequence is invalid

Check that migration versions begin at `000`, contain no gaps, and are not
duplicated.

### Applied migration was modified

Restore the original committed migration. Add a new migration instead of
editing an applied one.

### Seed file was not found

Create `workingDir/seeds/{environment}_seed.sql`, or select `Yes` and provide
another local `.sql` file when prompted.
