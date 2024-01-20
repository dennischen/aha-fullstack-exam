


export const dynamic = 'force-dynamic' // defaults to force-static


import { ApiContext, validator } from "@/app/api/v0"
import { CommonResponse, SignupForm, SignupFormSchema } from "@/app/api/v0/dto"
import { checkJson, checkArgument, withApiContext } from "@/app/api/v0/utils"
import { NextRequest, NextResponse } from "next/server"

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
 *               $ref: '#/components/schemas/Authentication'
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
    return withApiContext(async (context: ApiContext) => {
        const arg = await checkJson(req)
        const signupForm = await checkArgument(validator, SignupFormSchema, arg) as SignupForm

        return Response.json({ message: `Not implemented yet.`, error: true } as CommonResponse, { status: 500 })
    })
}