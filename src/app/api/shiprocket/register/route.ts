import { NextResponse } from 'next/server';

/**
 * Endpoint receiving the App Auth Token from Saleor upon installation.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[Saleor App Register] Received App Token:', body);
    return NextResponse.json({ success: true, message: 'Saleor Shiprocket App registered successfully' });
  } catch (error) {
    console.error('[Saleor App Register Error]', error);
    return NextResponse.json({ success: false, error: 'Invalid registration payload' }, { status: 400 });
  }
}
