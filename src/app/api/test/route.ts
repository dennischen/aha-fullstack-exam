


export const dynamic = 'force-dynamic' // defaults to force-static


import { NextRequest, NextResponse } from "next/server"


export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)

    const id = searchParams.get('id') || undefined

    return Response.json({ id })
}

export async function POST(req: NextRequest, res: NextResponse) {
    const contentType = req.headers.get('Content-Type')

    let detail: any
    let content: any

    if (contentType && contentType.indexOf('application/json') >= 0) {
        const json = await req.json()
        content = json.content
        detail = json.detail

    } else if (contentType &&
        (contentType.indexOf('multipart/form-data') >= 0 || contentType.indexOf('application/x-www-form-urlencoded') >= 0)) {
        const formData = await req.formData()
        content = formData.get('content')
        detail = formData.get('detail')
    } else {
        return new Response("", { status: 400, statusText: "unknown content type " + contentType })
    }

    if (content !== '' && !content) {
        return new Response("", { status: 400, statusText: "no content to calculate" })
    }



    return Response.json({ content, detail })
}