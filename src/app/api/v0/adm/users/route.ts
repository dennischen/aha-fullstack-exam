


export const dynamic = 'force-dynamic' // defaults to force-static


import { CommonResponse } from "@/app/api/schema"
import { NextRequest, NextResponse } from "next/server"


/**
 * @swagger
 * /api/v0/adm/users:
 *   post:
 *     description: "Query multiple user's information with pagination."
 *     operationId: pri#queryUsers
 *     requestBody:
 *       description: 'Pagination information for the query'
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInfoQuery'
 *       required: true
 *     responses:
 *       200:
 *         description: "Successfully retrieve user info list in a page."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfoPage'
 *       400:
 *         description: 'Invalid arguments supplied.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResponse'
 *       401:
 *         description: 'User is not authenticated.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResponse'
 *     security:
 *       - authToken: [] 
 *     tags:
 *       - adm
 */
export async function POST(req: NextRequest, res: NextResponse) {
    const contentType = req.headers.get('Content-Type')

    if (!contentType || contentType.indexOf('application/json') < 0) {
        return Response.json({ message: `unsupported content type ${contentType}`, error: true } as CommonResponse, { status: 400 })
    }

    return Response.json({ message: `Not implemented yet.`, error: true } as CommonResponse, { status: 500 })
}