import { NextResponse } from 'next/server';
import { trackShiprocketShipment } from '@/lib/shiprocket';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ awb: string }> }
) {
  const { awb } = await params;

  if (!awb) {
    return NextResponse.json({ error: 'AWB code is required' }, { status: 400 });
  }

  const result = await trackShiprocketShipment(awb);
  return NextResponse.json(result);
}
