import chalk from 'chalk';

type ChalkStyle = (text: string) => string;

interface TemplateOptions {
  label: string;
  color: ChalkStyle;
  backgroundColor: ChalkStyle;
  descriptionColor: ChalkStyle;
  description: string;
}

export function template({
  label,
  color,
  backgroundColor,
  descriptionColor,
  description,
}: TemplateOptions): string {
  const formattedLabel = ` ${label.toUpperCase().padEnd(7)} `;
  const badge = backgroundColor(color(chalk.bold(formattedLabel)));

  return `${badge} ${descriptionColor(description)}`;
}

export const logger = {
  error(description: string): void {
    console.log(
      template({
        label: 'Error',
        color: chalk.white,
        backgroundColor: chalk.bgRed,
        descriptionColor: chalk.red,
        description,
      }),
    );
  },

  info(description: string): void {
    console.log(
      template({
        label: 'Info',
        color: chalk.white,
        backgroundColor: chalk.bgBlue,
        descriptionColor: chalk.blue,
        description,
      }),
    );
  },

  success(description: string): void {
    console.log(
      template({
        label: 'Success',
        color: chalk.white,
        backgroundColor: chalk.bgGreen,
        descriptionColor: chalk.green,
        description,
      }),
    );
  },

  warning(description: string): void {
    console.log(
      template({
        label: 'Warning',
        color: chalk.white,
        backgroundColor: chalk.bgYellow,
        descriptionColor: chalk.yellow,
        description,
      }),
    );
  },
};
