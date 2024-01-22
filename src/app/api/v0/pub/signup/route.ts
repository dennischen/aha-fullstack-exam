import { ApiContext, ApiError } from "@/app/api/v0"
import { CommonResponse, SignupForm, SignupFormSchema } from "@/app/api/v0/dto"
import { generateActivationToken, hashPassword, responseJson, sendActivationEamil, validateApiArgument, validateJson, validatePasswordRule } from "@/app/api/v0/utils"
import withApiContext from "@/app/api/v0/withApiContext"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic' // defaults to force-static
/**
 * @swagger
 * /api/v0/pub/signup:
 *   post:
 *     description: 'User sign-up system to create a new user and obtain an authentication token for subsequent API calls.'
 *     operationId: pub#signup
 *     requestBody:
 *       description: 
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupForm'
 *       required: true
 *     responses:
 *       200:
 *         description: 'Successful sign-up to create a new user.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResponse'
 *       400:
 *         description: 'Invalid arguments supplied.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResponse'
 *       401:
 *         description: 'User is allow to be created, wrong email, duplicated email, or any other reason.'
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
        const signupForm: SignupForm = await validateApiArgument(arg, SignupFormSchema)

        /**
         * 1. Check if the user already exists.
         * 2. Verify the password against specific rules.
         * 3. Create a new user with a securely hashed and salted password, without requiring activation.
         * 4. Create activation and send an activation email to the user.
         * 5. Respond with an "OK" status.
         */

        const userDao = await context.getUserDao()
        const activationDao = await context.getActivationDao()

        const existedUser = await userDao.findByEmail(signupForm.email)
        if (existedUser) {
            throw new ApiError(`user '${signupForm.email}' is already existed, use another email to signup`)
        }

        await validatePasswordRule(signupForm.password)

        const hashedPassword = await hashPassword(signupForm.password)

        await context.beginTx()

        const newUser = await userDao.create({
            email: signupForm.email,
            hashedPassword: hashedPassword,
            displayName: signupForm.displayName,
        })

        const activationToken = await generateActivationToken()

        const newActivation = await activationDao.create({
            token: activationToken,
            userUid: newUser.uid
        })

        await sendActivationEamil(newUser, newActivation)

        return responseJson<CommonResponse>({ message: `User '${newUser.email}' has been created, please check the email for the activation` })
    })
}