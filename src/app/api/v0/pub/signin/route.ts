


export const dynamic = 'force-dynamic' // defaults to force-static


import { CommonResponse } from "@/app/api/schema"
import { NextRequest, NextResponse } from "next/server"

/**
 * @swagger
 * /api/v0/pub/signin:
 *   post:
 *     description: 'User sign-in using email and password to obtain an authentication token for subsequent API calls.'
 *     operationId: pub#signin
 *     requestBody:
 *       description: 
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SigninForm'
 *       required: true
 *     responses:
 *       200:
 *         description: 'Successful sign-in with correct email and password.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Authentication'
 *       400:
 *         description: 'Invalid arguments supplied.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResponse'
 *       401:
 *         description: 'User is not authenticated, either wrong email or wrong password.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResponse'
 *     tags:
 *       - pub
 */
export async function POST(req: NextRequest, res: NextResponse) {
    const contentType = req.headers.get('Content-Type')


    if (!contentType || contentType.indexOf('application/json') < 0) {
        return Response.json({ message: `unsupported content type ${contentType}`, error: true } as CommonResponse, { status: 400 })
    }



    return Response.json({ message: `Not implemented yet.`, error: true } as CommonResponse, { status: 500 })
}