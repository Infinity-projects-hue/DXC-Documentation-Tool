import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.rewrite(new URL("/api/analyze-v2", request.url));
}

export const config = {
  matcher: ["/api/analyze"],
};
