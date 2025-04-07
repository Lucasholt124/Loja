import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const referer = request.headers.get('referer') || '/';

  const mode = await draftMode(); // <- await também aqui
  mode.disable();

  return NextResponse.redirect(referer);
}
