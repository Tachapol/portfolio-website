import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Redirect logic
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')

  // Performance Optimization: Skip heavy Supabase auth network calls on public routes
  if (!isAdminPage && !isLoginPage) {
    return supabaseResponse
  }

  // This is required to refresh token if it's expired (only runs for /admin and /login paths)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isAdminPage && !user) {
    // If not authenticated, redirect to /login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Optional: Add redirect param so user returns to original page after login
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (isLoginPage && user) {
    // If already authenticated, redirect to /admin
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
