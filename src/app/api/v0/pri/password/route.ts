

import { ApiContext } from "@/app/api/v0"
import { CommonResponse, UpdatePasswordForm, UpdatePasswordFormSchema } from "@/app/api/v0/dto"
import { responseJson, validateApiArgument, validateJson, withApiContext } from "@/app/api/v0/utils"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic' // defaults to force-static


/**
 * @swagger
 * /api/v0/pri/password:
 *   post:
 *     description: "Update user's password"
 *     operationId: pri#updatePassword
 *     requestBody:
 *       description: 
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePasswordForm'
 *       required: true
 *     responses:
 *       200:
 *         description: "Successfully update user's password."
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
        const arg = await validateJson(req)
        const updatePasswordForm: UpdatePasswordForm = await validateApiArgument(arg, UpdatePasswordFormSchema)

        /**
         * 1. Get the authToken from the header.
         * 2. Check if the authentication session exists and is still valid.
         * 3. Compare the hashed password of the user with the hashed password in the update form.
         * 4. Verify the new password against specific rules.
         * 5. Update the user's password with a securely hashed and salted password.
         * 6. Update the lastAccessDatetime of the authentication and user.
         * 7. Respond with an "OK" status.
         */



        return responseJson<CommonResponse>({ message: `Not implemented yet.`, error: true }, { status: 500 })
    })
}