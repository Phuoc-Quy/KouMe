import nodemailer from 'nodemailer';

const getTransporter = () => {
  const user = process.env.MAIL_USER;
  const password = process.env.MAIL_PASSWORD;

  if (!user || !password) {
    throw new Error('Mail configuration is missing');
  }

  return nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: user,
      pass: password,
    },
  });
};

export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const sendMail = async (
  email: string,
  subject: string,
  text: string,
  html?: string,
): Promise<void> => {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject,
    text,
    html,
  });
};

export const sendOtpMail = async (
  email: string,
  otp: string,
): Promise<void> => {
  await sendMail(
    email,
    'Verify your KouMe account',
    `Your verification code is ${otp}.`,
    `
      <p>Your verification code is <strong>${otp}</strong>.</p>
    `,
  );
};
