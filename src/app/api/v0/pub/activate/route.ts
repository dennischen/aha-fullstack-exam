


export const dynamic = 'force-dynamic' // defaults to force-static


import { CommonResponse } from "@/app/api/schema"
import { NextRequest, NextResponse } from "next/server"

/**
 * @swagger
 * /api/v0/pub/activate:
 *   post:
 *     description: 'Activate a user account by using a token, then obtain an authentication token for subsequent API calls.'
 *     operationId: pub#activate
 *     requestBody:
 *       description: 
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivationForm'
 *       required: true
 *     responses:
 *       200:
 *         description: "Successfully activate the user's account."
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
 *         description: 'User is not activated, the token is revoked or invalid.'
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