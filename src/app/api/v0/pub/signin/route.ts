/*
 * @author: Dennis Chen
 */

import { Authentication, CommonResponse, SigninForm, SigninFormSchema } from "@/app/api/v0/dto"
import { generateAuthSessionToken, responseJson, validateApiArgument, validateJson, verifyPassword } from "@/app/api/v0/utils"
import withApiContext from "@/app/api/v0/withApiContext"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic' // always use dyanmic

/**
 * @swagger
 * /api/v0/pub/signin:
 *   post:
 *     description: 'User sign-in using email and password to obtain an authentication token for subsequent API calls.'
 *     operationId: pub#signin
 *     requestBody:
 *       description: 
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SigninForm'
 *       required: true
 *     responses:
 *       200:
 *         description: 'Successful sign-in with correct email and password.'
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
 *         description: 'User is not authenticated, either wrong email or wrong password.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResponse'
 *     tags:
 *       - pub
 */
export async function POST(req: NextRequest, res: NextResponse) {
    return withApiContext(async ({ context }) => {
        const arg = await validateJson(req)
        const signinForm: SigninForm = await validateApiArgument(arg, SigninFormSchema)

        /**
         * 1. Check if the user exists.
         * 2. Compare the hashed password of the user with the hashed sign-in password.
         * 3. Create a new authentication session.
         * 4. Update lastAccessDatetime of the user
         * 5. Respond with the authentication.
         */

        const userDao = await context.getUserDao()
        const authSessionDao = await context.getAuthSessionDao()

        let user = await userDao.findByEmail(signinForm.email)

        if (!user) {
            return responseJson<CommonResponse>({ message: `Wrong email or password`, error: true }, { status: 401 })
        }

        if (!await verifyPassword(signinForm.password, user.hashedPassword)) {
            return responseJson<CommonResponse>({ message: `Wrong email or password`, error: true }, { status: 401 })
        }

        if (user.disabled) {
            return responseJson<CommonResponse>({ message: `User is disabled`, error: true }, { status: 403 })
        }

        await context.beginTx()

        const now = new Date().getTime()

        user = await userDao.update(user.uid, { lastAccessDatetime: now, loginCount: (user.loginCount ?? 0) + 1 })

        //create new auth session
        const authSession = await authSessionDao.create({ token: await generateAuthSessionToken(), userUid: user.uid })

        return responseJson<Authentication>({ authToken: authSession.token, profile: { email: user.email, displayName: user.displayName, activated: user.activated } })

    })
}