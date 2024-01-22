import { ApiContext } from "@/app/api/v0"
import { ActivationForm, ActivationFormSchema, Authentication, CommonResponse } from "@/app/api/v0/dto"
import { generateAuthSessionToken, responseJson, validateApiArgument, validateJson, withApiContext } from "@/app/api/v0/utils"
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

        const activationDao = await context.getActivationDao()

        const activation = await activationDao.findByToken(activationForm.token)

        if (!activation) {
            return responseJson<CommonResponse>({ message: `No such activation '${activationForm.token}'`, error: true }, { status: 400 })
        }
        if (activation!.activatedDatetime) {
            return responseJson<CommonResponse>({ message: `Can't activate '${activationForm.token}' again`, error: true }, { status: 400 })
        }


        const now = new Date().getTime()

        //update activation
        await context.beginTx()
        activationDao.update(activation!.uid, { activatedDatetime: now })

        const userDao = await context.getUserDao()
        //update user
        let user = await userDao.get(activation!.userUid)
        user = await userDao.update(activation!.userUid, { activated: true, lastAccessDatetime: now, loginCount: (user.loginCount ?? 0) + 1 })

        const authSessionDao = await context.getAuthSessionDao()
        //create new auth session
        const authSession = await authSessionDao.create({ token: await generateAuthSessionToken(), userUid: user.uid })

        await context.commit()

        return responseJson<Authentication>({ authToken: authSession.token, profile: { email: user.email, displayName: user.displayName, activated: user.activated } })
    })
}