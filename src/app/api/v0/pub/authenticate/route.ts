


export const dynamic = 'force-dynamic' // defaults to force-static


import { CommonResponse } from "@/app/api/v0/dto"
import { NextRequest, NextResponse } from "next/server"

/**
 * @swagger
 * /api/v0/pub/authenticate:
 *   post:
 *     description: 'Verify if the authToken is still valid for subsequent API calls.'
 *     operationId: pub#authenticate
 *     requestBody:
 *       description: 
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthenticationForm'
 *       required: true
 *     responses:
 *       200:
 *         description: 'The authToken is still valid'
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
 *         description: 'The authToken is no longer available.'
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