import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch iCal data: ${response.statusText}`);
    }

    const icalData = await response.text();
    return NextResponse.json({ data: icalData });
    
  } catch (error) {
    console.error('Error in fetch-ical:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch iCal data' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
