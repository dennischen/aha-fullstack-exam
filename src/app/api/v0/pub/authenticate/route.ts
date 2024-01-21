import { ApiContext } from "@/app/api/v0"
import { AuthenticationForm, AuthenticationFormSchema, CommonResponse, SigninForm, SigninFormSchema } from "@/app/api/v0/dto"
import { responseJson, validateApiArgument, validateJson, withApiContext } from "@/app/api/v0/utils"
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
 *     tags:
 *       - pub
 */
export async function POST(req: NextRequest, res: NextResponse) {
    return withApiContext(async (context: ApiContext) => {
        const arg = await validateJson(req)
        const authenticationForm: AuthenticationForm = await validateApiArgument(arg, AuthenticationFormSchema)

        /**
         * 1. Check if the authentication session exists and is still valid (logout will invalidate it).
         * 2. Update the lastAccessDatetime of the authentication and user.
         * 3. Respond with the authentication details.
         */


        return responseJson<CommonResponse>({ message: `Not implemented yet.`, error: true }, { status: 500 })
    })
}