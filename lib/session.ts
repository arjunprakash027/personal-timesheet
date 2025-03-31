// lib/session.ts
import { SessionOptions } from 'iron-session';

export interface IronSessionCustom {
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'fhjkbvihbeuivbiuerbviebrviuebrvhsfjkghjernuiervgeeghjkernbfuierbvuehr',
  cookieName: 'timesheet-session',
  cookieOptions: {
    // In production, secure cookies should be used
    secure: true,
  },
};
