
/*
 * @author: Dennis Chen
 */

import { CommonResponse, Profile, UpdateProfileForm, UpdateProfileFormSchema } from "@/app/api/v0/dto"
import { responseJson, validateApiArgument, validateAuthSession, validateAuthToken, validateJson } from "@/app/api/v0/utils"
import withApiContext from "@/app/api/v0/withApiContext"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic' // always use dyanmic

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

    return withApiContext(async ({ context }) => {
        const authToken = await validateAuthToken(req)

        /**
         * 1. Get the authToken from the header.
         * 2. Check if the authentication session exists and is still valid.
         * 3. Update the lastAccessDatetime of the authentication and user.
         * 4. Respond with the profile.
         */

        const authSessionDao = await context.getAuthSessionDao()
        const userDao = await context.getUserDao()

        const authSession = await authSessionDao.findByToken(authToken)
        await validateAuthSession(authSession)

        let user = await userDao.get(authSession!.userUid)

        await context.beginTx()

        const now = new Date().getTime()

        user = await userDao.update(user.uid, { lastAccessDatetime: now })

        await authSessionDao.update(authSession!.uid, { lastAccessDatetime: now })

        return responseJson<Profile>({ 
            email: user.email, 
            displayName: 
            user.displayName, 
            activated: user.activated,
            singinDomain: authSession!.signinDomain
        })
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
    return withApiContext(async ({ context }) => {
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

        const authSessionDao = await context.getAuthSessionDao()
        const userDao = await context.getUserDao()

        const authSession = await authSessionDao.findByToken(authToken)
        await validateAuthSession(authSession)

        let user = await userDao.get(authSession!.userUid)

        if (!user.activated) {
            return responseJson<CommonResponse>({ message: 'User is not activated yet', error: true }, { status: 403 })
        }

        await context.beginTx()

        const now = new Date().getTime()

        user = await userDao.update(user.uid, { displayName: updateProfileForm.displayName, lastAccessDatetime: now })

        await authSessionDao.update(authSession!.uid, { lastAccessDatetime: now })

        return responseJson<Profile>({ 
            email: user.email, 
            displayName: user.displayName, 
            activated: user.activated,
            singinDomain: authSession!.signinDomain
        })
    })
}