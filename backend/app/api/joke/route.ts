import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://icanhazdadjoke.com/', {
      headers: { Accept: 'application/json' },
      // Cache the joke response for a short time at the edge
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch joke from external API' }, { status: 502 });
    }

    const data = await res.json();
    // Return the joke JSON as-is
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching joke:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
