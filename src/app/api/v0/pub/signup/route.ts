


export const dynamic = 'force-dynamic' // defaults to force-static


import { CommonResponse } from "@/app/api/schema"
import { NextRequest, NextResponse } from "next/server"

/**
 * @swagger
 * /api/v0/pub/signup:
 *   post:
 *     description: 'User sign-up system to create a new user and obtain an authentication token for subsequent API calls.'
 *     operationId: pub#signup
 *     requestBody:
 *       description: 
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupForm'
 *       required: true
 *     responses:
 *       200:
 *         description: 'Successful sign-up to create a new user.'
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
 *         description: 'User is allow to be created, wrong email, duplicated email, or any other reason.'
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