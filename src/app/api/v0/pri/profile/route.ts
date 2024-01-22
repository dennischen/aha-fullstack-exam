
import { ApiContext } from "@/app/api/v0"
import { CommonResponse, SignupForm, SignupFormSchema, UpdateProfileForm, UpdateProfileFormSchema } from "@/app/api/v0/dto"
import { responseJson, validateApiArgument, validateAuthToken, validateJson, withApiContext } from "@/app/api/v0/utils"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic' // defaults to force-static

/**
 * @swagger
 * /api/v0/pri/profile:
 *   get:
 *     description: "Get user's profile"
 *     operationId: pri#getProfile
 *     responses:
 *       200:
 *         description: "Successfully get user's profile."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
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
        const arg = await validateJson(req)
        const signupForm: SignupForm = await validateApiArgument(arg, SignupFormSchema)

        /**
         * 1. Get the authToken from the header.
         * 2. Check if the authentication session exists and is still valid.
         * 3. Update the lastAccessDatetime of the authentication and user.
         * 4. Respond with the profile.
         */

        return responseJson<CommonResponse>({ message: `Not implemented yet.`, error: true }, { status: 500 })
    })
}

/**
 * @swagger
 * /api/v0/pri/profile:
 *   post:
 *     description: 'Update user profile'
 *     operationId: pri#updateProfile
 *     requestBody:
 *       description: 
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileForm'
 *       required: true
 *     responses:
 *       200:
 *         description: "Successfully update user's profile."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
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
 *       - pri
 */
export async function POST(req: NextRequest, res: NextResponse) {
    return withApiContext(async (context: ApiContext) => {
        const authToken = await validateAuthToken(req)
        const arg = await validateJson(req)
        const updateProfileForm: UpdateProfileForm = await validateApiArgument(arg, UpdateProfileFormSchema)

        /**
         * 1. Get the authToken from the header.
         * 2. Check if the authentication session exists and is still valid.
         * 3. Update the user's display name.
         * 4. Update the lastAccessDatetime of the authentication and user.
         * 5. Respond with the updated profile.
         */



        return responseJson<CommonResponse>({ message: `Not implemented yet.`, error: true }, { status: 500 })
    })
}