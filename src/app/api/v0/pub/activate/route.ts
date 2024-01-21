import { ApiContext } from "@/app/api/v0"
import { ActivationForm, ActivationFormSchema, CommonResponse, SigninForm, SigninFormSchema } from "@/app/api/v0/dto"
import { responseJson, validateApiArgument, validateJson, withApiContext } from "@/app/api/v0/utils"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic' // defaults to force-static

/**
 * @swagger
 * /api/v0/pub/activate:
 *   post:
 *     description: 'Activate a user account by using a token, then obtain an authentication token for subsequent API calls.'
 *     operationId: pub#activate
 *     requestBody:
 *       description: 
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivationForm'
 *       required: true
 *     responses:
 *       200:
 *         description: "Successfully activate the user's account."
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
 *         description: 'User is not activated, the token is revoked or invalid.'
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
        const activationForm: ActivationForm = await validateApiArgument(arg, ActivationFormSchema)

        /**
         * 1. Check if the activation exists and is valid.
         * 2. Set the user as activated and update the lastAccessDatetime.
         * 3. Update activation status and invalidate all other validations for the same user.
         * 4. Create a new authentication session.
         * 5. Respond with the authentication details.
         */


        return responseJson<CommonResponse>({ message: `Not implemented yet.`, error: true }, { status: 500 })
    })
}