import { ApiContext } from "@/app/api/v0"
import { CommonResponse, SigninForm, SigninFormSchema } from "@/app/api/v0/dto"
import { responseJson, validateApiArgument, validateJson, withApiContext } from "@/app/api/v0/utils"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic' // defaults to force-static

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
    return withApiContext(async (context: ApiContext) => {
        const arg = await validateJson(req)
        const signupForm: SigninForm = await validateApiArgument(arg, SigninFormSchema)

        /**
         * 1. Check if the user exists.
         * 2. Compare the hashed password of the user with the hashed sign-in password.
         * 3. Create a new authentication session.
         * 4. Update lastAccessDatetime of the user
         * 5. Respond with the authentication.
         */


        return responseJson<CommonResponse>({ message: `Not implemented yet.`, error: true }, { status: 500 })
    })
}