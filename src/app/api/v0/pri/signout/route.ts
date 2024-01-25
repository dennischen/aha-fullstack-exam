
/*
 * @author: Dennis Chen
 */

import { CommonResponse } from "@/app/api/v0/dto"
import { responseJson, validateAuthSession, validateAuthToken } from "@/app/api/v0/utils"
import withApiContext from "@/app/api/v0/withApiContext"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic' // always use dyanmic

/**
 * @swagger
 * /api/v0/pri/signout:
 *   get:
 *     description: "Signout user session"
 *     operationId: pri#signout
 *     responses:
 *       200:
 *         description: "Successfully logged out."
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

    return withApiContext(async ({ context }) => {
        const authToken = await validateAuthToken(req)

        /**
         * 1. Get the authToken from the header.
         * 2. Check if the authentication session exists and is still valid.
         * 3. Update the lastAccessDatetime of the authentication session and user, update invalid of session
         * 4. Respond 'OK'
         */

        const authSessionDao = await context.getAuthSessionDao()
        const userDao = await context.getUserDao()

        const authSession = await authSessionDao.findByToken(authToken)

        await validateAuthSession(authSession)

        await context.beginTx()

        const now = new Date().getTime()

        await authSessionDao.update(authSession!.uid, { invalid: true, lastAccessDatetime: now })

        await userDao.update(authSession!.userUid, { lastAccessDatetime: now })

        return responseJson<CommonResponse>({ message: 'User signed out, token was revoked' })
    })
}
