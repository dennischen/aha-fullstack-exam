
import { ApiContext } from "@/app/api/v0"
import { CommonResponse, SignupForm, ActivationFormSchema, ActivationForm } from "@/app/api/v0/dto"
import { responseJson, validateApiArgument, validateAuthToken, validateJson, withApiContext } from "@/app/api/v0/utils"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic' // defaults to force-static

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
    return withApiContext(async (context: ApiContext) => {
        const authToken = await validateAuthToken(req)
        const arg = await validateJson(req)

        /**
         * 1. Get the authToken from the header.
         * 2. Check if the authentication session exists and is still valid.
         * 3. Check if the user is still invalid and invalidate expired validations for the same user.
         * 4. Create a new activation and send an activation email to the user.
         * 6. Update the lastAccessDatetime of the authentication and user.
         * 7. Respond with an "OK" status.
         */


        return responseJson<CommonResponse>({ message: `Not implemented yet.`, error: true }, { status: 500 })
    })
}
