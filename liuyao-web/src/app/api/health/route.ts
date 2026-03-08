import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    success: true,
    data: {
      ok: true,
      service: 'liuyao-web',
      timestamp: new Date().toISOString(),
    },
    error: null,
  });
}
