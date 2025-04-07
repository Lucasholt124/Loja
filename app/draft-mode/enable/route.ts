import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const mode = await draftMode(); // <- await obrigatório!
  mode.enable(); // agora funciona

  const redirectTo = request.nextUrl.searchParams.get('sanity-preview-pathname') || '/';
  const url = new URL(redirectTo, request.nextUrl.origin);

  return NextResponse.redirect(url);
}
