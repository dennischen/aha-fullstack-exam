


export const dynamic = 'force-dynamic' // defaults to force-static


import { CommonResponse } from "@/app/api/v0/dto"
import { NextRequest, NextResponse } from "next/server"


/**
 * @swagger
 * /api/v0/pri/password:
 *   post:
 *     description: "Update user's password"
 *     operationId: pri#updatePassword
 *     requestBody:
 *       description: 
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePasswordForm'
 *       required: true
 *     responses:
 *       200:
 *         description: "Successfully update user's password."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
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
 *       - pri
 */
export async function POST(req: NextRequest, res: NextResponse) {
    const contentType = req.headers.get('Content-Type')

    if (!contentType || contentType.indexOf('application/json') < 0) {
        return Response.json({ message: `unsupported content type ${contentType}`, error: true } as CommonResponse, { status: 400 })
    }

    return Response.json({ message: `Not implemented yet.`, error: true } as CommonResponse, { status: 500 })
}