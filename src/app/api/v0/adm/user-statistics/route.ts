


export const dynamic = 'force-dynamic' // defaults to force-static


import { CommonResponse } from "@/app/api/v0/dto"
import { NextRequest, NextResponse } from "next/server"

/**
 * @swagger
 * /api/v0/adm/user-statistics:
 *   get:
 *     description: 'Get user statistics'
 *     operationId: adm#getUserStatistics
 *     responses:
 *       200:
 *         description: 'Successfully retrieve user statistics.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserStatistics'
 *       401:
 *         description: 'User is not authenticated.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResponse'
 *       403:
 *         description: 'User is not permitted.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResponse'
 *     security:
 *       - authToken: [] 
 *     tags:
 *       - adm
 */
export async function GET(req: NextRequest, res: NextResponse) {
    

    return Response.json({ message: `Not implemented yet.`, error: true } as CommonResponse, { status: 500 })
}
