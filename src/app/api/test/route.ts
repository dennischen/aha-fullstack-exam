


export const dynamic = 'force-dynamic' // defaults to force-static


import { NextRequest, NextResponse } from "next/server"


/**
 * @swagger
 * /api/test:
 *   get:
 *     description: Returns a simple test json message
 *     operationId: test#get
 *     parameters:
 *       - name: id
 *         in: query
 *         description: any string for result verification
 *         required: false
 *         schema:
 *           type: string
 *           example: abcdefg
 *     responses:
 *       200:
 *         description: test a get request and return json result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: abcdefg
 *               required:
 *                 - id
 *       400:
 *         description: invalidate argument supplied
 * 
 */
export async function GET(req: NextRequest, res: NextResponse) {
    const { searchParams } = new URL(req.url)

    const id = searchParams.get('id') || undefined
    if (!id) {
        return Response.json({ msg: 'request parameter id not found' }, { status: 400 })
    }
    return Response.json({ id })
}
/**
 * @swagger
 * /api/test:
 *   post:
 *     description: Returns a simple test json message
 *     operationId: test#get
 *     requestBody:
 *       description: json object for result verification
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IdObject'
 *       required: true
 *     responses:
 *       200:
 *         description: test a get request and return json result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IdObject'
 *       400:
 *         description: invalidate argument supplied
 *       401:
 *         description: user is not authenticated
 *     security:
 *       - authToken: [] 
 */
export async function POST(req: NextRequest, res: NextResponse) { 
    const contentType = req.headers.get('Content-Type')


    if (!contentType || contentType.indexOf('application/json') < 0) {   
        return Response.json({ msg: `unsupported content type ${contentType}` }, { status: 400 })
    }

    const authToken = req.headers.get('authToken');

    if(!authToken){
        return Response.json({ msg: 'authToken not found' }, { status: 401 })
    }


    const json = await req.json()

    const id = json.id;

    if (!id) {
        return Response.json({ msg: 'json id not found' }, { status: 400 })
    }

    return Response.json({ id })
}