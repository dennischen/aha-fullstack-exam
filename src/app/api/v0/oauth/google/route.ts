
/*
 * @author: Dennis Chen
 */

import { ApiError } from "@/app/api/v0"
import { Authentication, CommonResponse } from "@/app/api/v0/dto"
import { generateAuthSessionToken, generateOAuthNewUserPassword, hashPassword, responseJson } from "@/app/api/v0/utils"
import withApiContext from "@/app/api/v0/withApiContext"
import { google } from "googleapis"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic' // always use dyanmic

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET
const REDIRECT_URI = process.env.WEB_BASE_URL + '/home/oauth/google'

/**
 * @swagger
 * /api/v0/oauth/google:
 *   get:
 *     description: "Google Oauth Signin/Signup"
 *     operationId: oauth#google
 *     parameters:
 *       - name: code
 *         in: query
 *         description: code from googal oauth REDIRECT_URI search parameters
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Successfully signin/singup to the system by Google Oauth."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Authentication'
 *       400:
 *         description: 'Aurgment is not valid.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResponse'
 *     tags:
 *       - oauth
 */
export async function GET(req: NextRequest, res: NextResponse) {

    return withApiContext(async ({ context }) => {

        const code = req.nextUrl.searchParams.get('code')
        if (!code) {
            return responseJson<CommonResponse>({ message: 'missing required parameter : code' }, { status: 404 })
        }


        /**
         * 1. Check if the oauth code is available and get the user's information
         * 2. Check if user is existed, if not, create new user with activat status
         * 3. Update lastAccessDatetime of the user
         * 4. Create a new authentication session.
         * 5. Respond with the authentication.
         */        

        const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

        let userEmail: string
        let userDisplayName: string

        try {
            const token = await oAuth2Client.getToken(code)
            oAuth2Client.setCredentials(token.tokens)


            // const tokenInfo = await oAuth2Client.getTokenInfo(
            //     oAuth2Client.credentials.access_token!
            // )
            // console.log("tokenInfo", tokenInfo)

            let oauth2Client = new google.auth.OAuth2()    // create new auth client
            oauth2Client.setCredentials({ access_token: oAuth2Client.credentials.access_token! })    // use the new auth client with the access_token
            let oauth2 = google.oauth2({
                auth: oauth2Client,
                version: 'v2'
            })
            let { data } = await oauth2.userinfo.get()    // get user info

            userEmail = data.email!
            userDisplayName = data.name || userEmail

            if (!userEmail || !userDisplayName) {
                return responseJson<CommonResponse>({ message: `Can't find email in google oauth` }, { status: 400 })
            }

        } catch (err: any) {
            console.log("Google OAuth error", err)
            throw new ApiError(err, 400)
        }

        const userDao = await context.getUserDao()
        const authSessionDao = await context.getAuthSessionDao()

        await context.beginTx()
        
        const now = new Date().getTime()

        let user = await userDao.findByEmail(userEmail)
        if (!user) {
            //sign in
            const hashedPassword = await hashPassword(await generateOAuthNewUserPassword())

            user = await userDao.create({
                email: userEmail,
                hashedPassword: hashedPassword,
                displayName: userDisplayName,
                activated: true
            })
            console.log(`Created new user ${userEmail} from google oauth `)
        }
        
        if (!user.activated) {
            user = await userDao.update(user.uid, {
                activated: true,
                lastAccessDatetime: now, 
                loginCount: (user.loginCount ?? 0) + 1 
            })
            console.log(`Activate user ${userEmail} from google oauth `)
        }else{
            user = await userDao.update(user.uid, { 
                lastAccessDatetime: now, 
                loginCount: (user.loginCount ?? 0) + 1 
            })
        }


        //create new auth session
        const authSession = await authSessionDao.create({ token: await generateAuthSessionToken(), userUid: user.uid })

        console.log(`User ${user.email} signin system from google oauth`)

        return responseJson<Authentication>({ authToken: authSession.token, profile: { email: user.email, displayName: user.displayName, activated: user.activated } })
    })
}
