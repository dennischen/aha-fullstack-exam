
/*
 * @author: Dennis Chen
 */

import { CommonResponse } from "@/app/api/v0/dto"
import { generateActivationToken, responseJson, sendActivationEamil, validateAuthSession, validateAuthToken } from "@/app/api/v0/utils"
import withApiContext from "@/app/api/v0/withApiContext"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic' // always use dyanmic

/**
 * @swagger
 * /api/v0/pri/send-activation:
 *   get:
 *     description: 'Send activation email to the user for account activation.'
 *     operationId: pri#sendActivation
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
    return withApiContext(async ({ context }) => {
        const authToken = await validateAuthToken(req)

        /**
         * 1. Get the authToken from the header.
         * 2. Check if the authentication session exists and is still valid.
         * 3. Check if the user is still in-activated.
         * 4. Create a new activation and send an activation email to the user.
         * 6. Update the lastAccessDatetime of the authentication and user.
         * 7. Respond with an "OK" status.
         */

        const authSessionDao = await context.getAuthSessionDao()
        const userDao = await context.getUserDao()
        const activationDao = await context.getActivationDao()

        const authSession = await authSessionDao.findByToken(authToken)
        await validateAuthSession(authSession)

        await context.beginTx()

        const now = new Date().getTime()

        await authSessionDao.update(authSession!.uid, { lastAccessDatetime: now })


        const user = await userDao.update(authSession!.userUid, { lastAccessDatetime: now })

        if (user.activated) {
            return responseJson<CommonResponse>({ message: 'User is activated, no need to re-activate' })
        }

        //TODO invalidate old activation

        const activationToken = await generateActivationToken()
        const newActivation = await activationDao.create({
            token: activationToken,
            userUid: user.uid
        })

        await sendActivationEamil(user, newActivation)

        return responseJson<CommonResponse>({ message: `Please check the email '${user.email}' for the activation` })
    })
}
