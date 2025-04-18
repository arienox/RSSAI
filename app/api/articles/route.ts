import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function GET(request: Request) {
  try {
    // Get search parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    
    let url = `${API_URL}/news`;
    
    // Add category filter if provided
    if (category) {
      url = `${API_URL}/news/${category}`;
    }
    
    // Add pagination
    url += `?page=${page}&limit=${limit}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { message: 'Failed to fetch articles', error: (error as Error).message },
      { status: 500 }
    );
  }
} 