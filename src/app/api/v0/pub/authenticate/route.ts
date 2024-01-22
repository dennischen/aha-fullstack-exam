import { ApiContext } from "@/app/api/v0"
import { Authentication, AuthenticationForm, AuthenticationFormSchema, CommonResponse } from "@/app/api/v0/dto"
import { responseJson, validateApiArgument, validateJson } from "@/app/api/v0/utils"
import withApiContext from "@/app/api/v0/withApiContext"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic' // defaults to force-static

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
 *       403:
 *         description: 'User is disabled.'
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
        const authenticationForm: AuthenticationForm = await validateApiArgument(arg, AuthenticationFormSchema)

        /**
         * 1. Check if the authentication session exists and is still valid (logout will invalidate it).
         * 2. Check if user is disabled
         * 3. Update the lastAccessDatetime of the authentication and user.
         * 4. Respond with the authentication details.
         */

        const authSessionDao = await context.getAuthSessionDao()
        const userDao = await context.getUserDao()

        let authSession = await authSessionDao.findByToken(authenticationForm.authToken)
        if (!authSession || authSession.invalid) {
            return responseJson<CommonResponse>({ message: `Token '${authenticationForm.authToken}' is not available`, error: true }, { status: 401 })
        }

        let user = await userDao.get(authSession.userUid)

        if (user.disabled) {
            return responseJson<CommonResponse>({ message: `User is disabled`, error: true }, { status: 403 })
        }

        await context.beginTx()

        const now = new Date().getTime()

        authSession = await authSessionDao.update(authSession.uid, { lastAccessDatetime: now })
        user = await userDao.update(user.uid, { lastAccessDatetime: now })

        return responseJson<Authentication>({ authToken: authSession.token, profile: { email: user.email, displayName: user.displayName, activated: user.activated } })
    })
}