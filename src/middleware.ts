import { middlewareRequest } from '@nextspace/server/request'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {

    //by using process.env[''], the value is replace in compile time, can't update dynamically
    const allowOrigin = process.env['CROS_ALLOW_ORIGIN']

    const response = NextResponse.next()
    if (allowOrigin) {
        //test by open dev console, type await (await fetch('http://127.0.0.1:3000/api/test?id=abcd')).json() 
        //
        
        // add the CORS headers to the response
        response.headers.append('Access-Control-Allow-Credentials', "true")
        response.headers.append('Access-Control-Allow-Origin', allowOrigin) // replace this your actual origin
        response.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
        response.headers.append(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        )
    }

    return response
}

export const config = {
    matcher: '/api/:path*',
}