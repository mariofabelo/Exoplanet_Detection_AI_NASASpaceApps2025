import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // Path to the K2 Data.csv file in the project root
    const csvPath = join(process.cwd(), '..', 'K2 Data.csv');
    
    // Read the CSV file
    const csvContent = readFileSync(csvPath, 'utf-8');
    
    // Return the CSV file as a download
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="K2_Data.csv"',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error serving K2 Data.csv:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
