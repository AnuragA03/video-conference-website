import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { create } from 'domain';


// This function is created to create protected routes that will only be working if you are authenticated otherwise you will be redirected to login page
const protectedRoutes = createRouteMatcher([
    '/',
    '/upcoming',
    '/previous',
    '/recordings',
    '/personal-room',
    '/meeting(.*)',
])


export default clerkMiddleware((auth, req) => {
    if(protectedRoutes(req)) auth().protect();
})


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}