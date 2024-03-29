
/*
 * @author: Dennis Chen
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const allowOrigin = process.env.WEB_CROS_ALLOW_ORIGIN
const allowHeaders = process.env.WEB_CROS_ALLOW_HEADERS || 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'

console.log(`Use ALLOW_ORIGIN: '${allowOrigin}' on API`)

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {

    const response = request.method === 'OPTIONS' ? new NextResponse('', { status: 200 }) : NextResponse.next()

    if (allowOrigin) {
        //test by open dev console, type await (await fetch('http://127.0.0.1:3000/api/test?id=abcd')).json() 

        // add the CORS headers to the response
        response.headers.append('Access-Control-Allow-Credentials', "true")
        response.headers.append('Access-Control-Allow-Origin', allowOrigin) // replace this your actual origin
        response.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
        //authToken is autenticate token for this app in api request
        response.headers.append(
            'Access-Control-Allow-Headers',
            allowHeaders + ', authToken'
        )
    }

    return response
}

export const config = {
    matcher: '/api/:path*',
}