import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

const PASSWORD_MIN_LENGTH = 8;

export const isValidPassword = (password: string): boolean => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return false;
  }

  const characterGroups = [
    /[a-z]/,
    /[A-Z]/,
    /[0-9]/,
    /[^A-Za-z0-9]/,
  ];

  return characterGroups.every((group) => group.test(password));
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (
  password: string,
  passwordHash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, passwordHash);
};
