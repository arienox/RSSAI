import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/feeds`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error('Failed to fetch feeds');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching feeds:', error);
    return NextResponse.json(
      { message: 'Failed to fetch feeds', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.url) {
      return NextResponse.json(
        { message: 'Feed URL is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/feeds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to add feed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding feed:', error);
    return NextResponse.json(
      { message: 'Failed to add feed', error: (error as Error).message },
      { status: 500 }
    );
  }
} 