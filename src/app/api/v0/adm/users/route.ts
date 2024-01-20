


export const dynamic = 'force-dynamic' // defaults to force-static

import { ApiContext } from "@/app/api/v0"
import { CommonResponse, UserInfoQuery, UserInfoQuerySchema } from "@/app/api/v0/dto"
import { validateApiArgument, validateJson, withApiContext } from "@/app/api/v0/utils"
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
    return withApiContext(async (context: ApiContext) => {
        const arg = await validateJson(req)
        const userInfoQuery: UserInfoQuery = await validateApiArgument(arg, UserInfoQuerySchema)

        /**
         * 1. Get the authToken from the header.
         * 2. Check if the authentication session exists and is still valid.
         * 3. Update the lastAccessDatetime of the authentication and user.
         * 4. Respond with the query result.
         */



        return Response.json({ message: `Not implemented yet.`, error: true } as CommonResponse, { status: 500 })
    })
}