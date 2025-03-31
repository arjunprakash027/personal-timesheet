// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

const HASHED_PASSWORD = process.env.HASHED_PASSWORD;

export async function POST(request: NextRequest) {
  if (!HASHED_PASSWORD) {
    return NextResponse.json(
      { success: false, message: 'Server configuration error.' },
      { status: 500 }
    );
  }

  const { password } = await request.json();

  if (!password || typeof password !== 'string') {
    return NextResponse.json(
      { success: false, message: 'Password is required.' },
      { status: 400 }
    );
  }

  // Compute the SHA-256 hash of the provided password (no salt)
  const submittedHash = crypto.createHash('sha256')
                              .update(password)
                              .digest('hex');

  if (submittedHash === HASHED_PASSWORD) {
    // Create a session using the cookies helper from Next.js
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json(
      { success: false, message: 'Invalid password.' },
      { status: 401 }
    );
  }
}
