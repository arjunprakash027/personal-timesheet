// app/api/timesheet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TimesheetEntry, { ITimesheetEntry } from '@/models/TimesheetEntry';

// --- GET Handler ---
export async function GET(request: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // e.g., '2025-03' (YYYY-MM)
  const year = searchParams.get('year'); // e.g., '2025'

  try {
    let query = {};

    // --- Filtering Knobs ---
    if (month) {
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        return NextResponse.json(
          { success: false, error: 'Invalid month format. Use YYYY-MM.' },
          { status: 400 }
        );
      }
      const [yearStr, monthStr] = month.split('-');
      const yearNum = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10);

      if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return NextResponse.json(
          { success: false, error: 'Invalid month value.' },
          { status: 400 }
        );
      }

      const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(yearNum, monthNum, 1, 0, 0, 0));

      console.log(
        `Filtering for month: ${month}, Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}`
      );

      query = {
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      };
    } else if (year) {
      const yearRegex = /^\d{4}$/;
      if (!yearRegex.test(year)) {
        return NextResponse.json(
          { success: false, error: 'Invalid year format. Use YYYY.' },
          { status: 400 }
        );
      }
      const yearNum = parseInt(year, 10);
      if (isNaN(yearNum)) {
        return NextResponse.json(
          { success: false, error: 'Invalid year value.' },
          { status: 400 }
        );
      }
      const startDate = new Date(Date.UTC(yearNum, 0, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(yearNum + 1, 0, 1, 0, 0, 0));

      console.log(
        `Filtering for year: ${year}, Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}`
      );

      query = {
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      };
    }
    // --- End Filtering Knobs ---

    
    const entries = await TimesheetEntry.find(query).sort({ date: -1, createdAt: -1 }).lean().select('-__v -createdAt -updatedAt');

    console.log('Fetched entries in routes:', entries);

    return NextResponse.json({ success: true, data: entries });
  } catch (error: unknown) {
    console.error('GET Error:', error);
    let errorMessage = 'Server error fetching timesheet entries.';
    let statusCode = 500;
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.name === 'ValidationError') {
        statusCode = 400;
      }
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });
  }
}

// --- POST Handler ---
export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    // Cast the parsed JSON to Partial<ITimesheetEntry>
    const body = (await request.json()) as Partial<ITimesheetEntry>;

    if (!body.date || !body.taskActivity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: date and taskActivity' },
        { status: 400 }
      );
    }

    const entryData: Partial<ITimesheetEntry> = {
      ...body,
      date: new Date(body.date),
    };

    (['focus', 'energy', 'productivity', 'enjoyment', 'challenge'] as const).forEach((key) => {
      if (entryData[key] === null || entryData[key] === undefined) {
        delete entryData[key];
      } else {
        const numValue = Number(entryData[key]);
        if (isNaN(numValue)) {
          return NextResponse.json(
            { success: false, error: `Invalid number format for ${key}` },
            { status: 400 }
          );
        }
        entryData[key] = numValue;
      }
    });

    const newEntry = new TimesheetEntry(entryData);
    await newEntry.save();

    return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
  } catch (error: unknown) {
    console.error('POST Error:', error);
    let errorMessage = 'Server error creating timesheet entry.';
    let statusCode = 500;
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.name === 'ValidationError') {
        statusCode = 400;
      }
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });
  }
}
