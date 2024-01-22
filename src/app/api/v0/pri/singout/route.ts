
import { ApiContext } from "@/app/api/v0"
import { CommonResponse } from "@/app/api/v0/dto"
import { responseJson, validateAuthSession, validateAuthToken, validateJson, withApiContext } from "@/app/api/v0/utils"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic' // defaults to force-static

/**
 * @swagger
 * /api/v0/pri/singout:
 *   get:
 *     description: "Singout user session"
 *     operationId: pri#logout
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

    return withApiContext(async (context: ApiContext) => {
        const authToken = await validateAuthToken(req)

        /**
         * 1. Get the authToken from the header.
         * 2. Check if the authentication session exists and is still valid.
         * 3. Update the lastAccessDatetime of the authentication session and user, update invalid of session
         * 4. Respond 'OK'
         */

        const authSessionDao = await context.getAuthSessionDao()

        const authSession = await authSessionDao.findByToken(authToken);
        await validateAuthSession(authSession)

        await context.beginTx()

        const now = new Date().getTime();

        await authSessionDao.update(authSession!.uid, { invalid: true, lastAccessDatetime: now})
        
        const userDao = await context.getUserDao()

        await userDao.update(authSession!.uid, {lastAccessDatetime: now})

        await context.commit()

        return responseJson<CommonResponse>({ message: 'User singed out, token was revoked'})
    })
}
