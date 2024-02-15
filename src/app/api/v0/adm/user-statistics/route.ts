
/*
 * @author: Dennis Chen
 */

import { CommonResponse, UserStatistics } from "@/app/api/v0/dto"
import { responseJson, validateAuthSession, validateAuthToken } from "@/app/api/v0/utils"
import withApiContext from "@/app/api/v0/withApiContext"
import { NextRequest, NextResponse } from "next/server"

import moment from "moment"

export const dynamic = 'force-dynamic' // always use dyanmic
/**
 * @swagger
 * /api/v0/adm/user-statistics:
 *   get:
 *     description: 'Get user statistics'
 *     operationId: adm#getUserStatistics
 *     responses:
 *       200:
 *         description: 'Successfully retrieve user statistics.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserStatistics'
 *       401:
 *         description: 'User is not authenticated.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResponse'
 *       403:
 *         description: 'User is not permitted.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResponse'
 *     security:
 *       - authToken: [] 
 *     tags:
 *       - adm
 */
export async function GET(req: NextRequest, res: NextResponse) {
    return withApiContext(async ({ context }) => {
        const authToken = await validateAuthToken(req)

        /**
         * 1. Get the authToken from the header.
         * 2. Check if the authentication session exists and is still valid.
         * 3. Update the lastAccessDatetime of the authentication and user.
         * 4. Respond with the query result.
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

        user = await userDao.update(user.uid, { lastAccessDatetime: now })

        await authSessionDao.update(authSession!.uid, { lastAccessDatetime: now })



        const totalSignedUpUser = await userDao.count()

        //TODO Depends on whose timezone?
        const momentNow = moment()
        const momentStartToday = moment().startOf('date')

        const totalActiveUserToday = await authSessionDao.countActiveUserBetween(momentStartToday.valueOf(), momentNow.valueOf())

        //TODO No data to track active user for every different user
        //consider to enhance schema to track or just user GA
        const avgActiveUserIn7Days = 0


        const userStatistics: UserStatistics = {
            totalSignedUpUser,
            totalActiveUserToday,
            avgActiveUserIn7Days,
        }

        return responseJson<UserStatistics>(userStatistics)
    })
}
