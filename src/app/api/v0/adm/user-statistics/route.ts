
/*
 * @author: Dennis Chen
 */

import { CommonResponse, UserStatistics, ValueOnDate } from "@/app/api/v0/dto"
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
        const dailyActiveUserDao = await context.getDailyActiveUserDao()

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
        const momentNow = moment()//.tz()
        const momentStartToday = momentNow.clone().startOf('date')
        const totalActiveUserToday = await authSessionDao.countActiveUserBetween(momentStartToday.valueOf(), momentNow.valueOf())

        //calculate n days rolling
        const rollingDays = 7
        const backwardDays = 7


        //start from yesterday
        const moEnd = momentNow.clone().subtract(1, 'day')
        const moStart = moEnd.clone().subtract(backwardDays + rollingDays, 'day')

        const dailyUsers = await dailyActiveUserDao.list(parseInt(moEnd.format('YYYYMMDD')), parseInt(moStart.format('YYYYMMDD')))
        const dailyUserMap = new Map(dailyUsers.map(item => [item.date, item]))

        const avgActiveUserIn7DaysRolling: ValueOnDate<number>[] = []

        for (let i = 0; i < backwardDays; i++) {
            //look backward n days
            const moBackwardDate = moEnd.clone().subtract(i, 'day')

            let sum = 0
            //calculate avg in n days
            for (let j = 0; j < rollingDays; j++) {
                const moRollingDate = moBackwardDate.clone().subtract(j, 'day')

                const v = dailyUserMap.get(parseInt(moRollingDate.format('YYYYMMDD')))
                if (v?.count) {
                    sum += v.count
                }
            }

            const avg = sum / rollingDays

            avgActiveUserIn7DaysRolling.push({
                date: moBackwardDate.format('YYYYMMDD'),
                //show decimal pleaces
                value: avg < 10 ? (Math.round(avg * 100) / 100) : (avg < 100 ? (Math.round(avg * 10) / 10) : Math.round(avg))
            })
        }

        const userStatistics: UserStatistics = {
            totalSignedUpUser,
            totalActiveUserToday,
            avgActiveUserIn7DaysRolling,
        }

        return responseJson<UserStatistics>(userStatistics)
    })
}
