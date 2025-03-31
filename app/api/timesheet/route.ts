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
      // Validate month format (YYYY-MM)
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        return NextResponse.json({ success: false, error: 'Invalid month format. Use YYYY-MM.' }, { status: 400 });
      }
      const [yearStr, monthStr] = month.split('-');
      const yearNum = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10); // 1-12

      if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
         return NextResponse.json({ success: false, error: 'Invalid month value.' }, { status: 400 });
      }

      const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1, 0, 0, 0)); // Month is 0-indexed in JS Date
      const endDate = new Date(Date.UTC(yearNum, monthNum, 1, 0, 0, 0)); // Start of next month

      console.log(`Filtering for month: ${month}, Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}`)

      query = {
        date: {
          $gte: startDate,
          $lt: endDate
        }
      };
    } else if (year) {
       // Validate year format (YYYY)
       const yearRegex = /^\d{4}$/;
       if (!yearRegex.test(year)) {
        return NextResponse.json({ success: false, error: 'Invalid year format. Use YYYY.' }, { status: 400 });
       }
       const yearNum = parseInt(year, 10);
       if (isNaN(yearNum)) {
         return NextResponse.json({ success: false, error: 'Invalid year value.' }, { status: 400 });
       }
       const startDate = new Date(Date.UTC(yearNum, 0, 1, 0, 0, 0)); // Jan 1st
       const endDate = new Date(Date.UTC(yearNum + 1, 0, 1, 0, 0, 0)); // Jan 1st of next year

        console.log(`Filtering for year: ${year}, Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}`)

        query = {
            date: {
            $gte: startDate,
            $lt: endDate
            }
        };
    }
    // --- End Filtering Knobs ---


    // Fetch entries, sorted by date descending
    const entries = await TimesheetEntry.find(query).sort({ date: -1, createdAt: -1 });

    return NextResponse.json({ success: true, data: entries });
  } catch (error: any) {
    console.error("GET Error:", error);
    // Provide more specific error message if it's a validation error
    const errorMessage = error.message || 'Server error fetching timesheet entries.';
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });
  }
}

// --- POST Handler ---
export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const body: Partial<ITimesheetEntry> = await request.json();

    // Basic validation (Mongoose schema handles more)
    if (!body.date || !body.taskActivity) {
       return NextResponse.json({ success: false, error: 'Missing required fields: date and taskActivity' }, { status: 400 });
    }

    // Ensure date is treated correctly (might come as string)
    const entryData = {
        ...body,
        date: new Date(body.date) // Convert string date to Date object if necessary
    };

    // Clean potentially empty optional number fields before saving
    // Mongoose might coerce empty strings to 0, which might not be desired if 0 is a valid value
    // Adjust this logic based on how you want to handle empty number inputs (null vs 0 vs undefined)
    (['focus', 'energy', 'productivity', 'enjoyment', 'challenge'] as const).forEach(key => {
        if (entryData[key] === '' || entryData[key] === null || entryData[key] === undefined) {
            delete entryData[key]; // Remove if empty/null/undefined
        } else {
            const numValue = Number(entryData[key]);
             if (isNaN(numValue)) {
                // Handle case where input is not a number (e.g., text entered)
                 return NextResponse.json({ success: false, error: `Invalid number format for ${key}` }, { status: 400 });
             }
             entryData[key] = numValue; // Assign the parsed number
        }
    });


    const newEntry = new TimesheetEntry(entryData);
    await newEntry.save(); // Mongoose validation happens here

    return NextResponse.json({ success: true, data: newEntry }, { status: 201 }); // 201 Created
  } catch (error: any) {
    console.error("POST Error:", error);
     // Provide more specific error message if it's a validation error
     const errorMessage = error.errors ? Object.values(error.errors).map((e: any) => e.message).join(', ') : error.message || 'Server error creating timesheet entry.';
     const statusCode = error.name === 'ValidationError' ? 400 : 500;
    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });
  }
}