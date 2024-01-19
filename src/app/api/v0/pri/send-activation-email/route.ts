


export const dynamic = 'force-dynamic' // defaults to force-static


import { CommonResponse } from "@/app/api/schema"
import { NextRequest, NextResponse } from "next/server"

/**
 * @swagger
 * /api/v0/pri/send-activation-email:
 *   get:
 *     description: 'Send email to the user for account activation.'
 *     operationId: pri#sendActivationEmail
 *     responses:
 *       200:
 *         description: 'Successfully sent activation email to the user or user is already activated'
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
export async function GET(req: NextRequest, res: NextResponse) {
    

    return Response.json({ message: `Not implemented yet.`, error: true } as CommonResponse, { status: 500 })
}
