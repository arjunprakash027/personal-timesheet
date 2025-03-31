// lib/session.ts
import { IronSessionOptions } from 'iron-session';

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_SECRET || 'fhjkbvihbeuivbiuerbviebrviuebrvhsfjkghjernuiervgeeghjkernbfuierbvuehr',
  cookieName: 'timesheet-session',
  cookieOptions: {
    // In production, secure cookies should be used
    secure: true,
  },
};
