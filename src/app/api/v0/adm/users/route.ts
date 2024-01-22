


export const dynamic = 'force-dynamic' // defaults to force-static

import { ApiContext } from "@/app/api/v0"
import { CommonResponse, UserInfo, UserInfoPage, UserInfoQuery, UserInfoQuerySchema } from "@/app/api/v0/dto"
import { responseJson, validateApiArgument, validateAuthSession, validateAuthToken, validateJson } from "@/app/api/v0/utils"
import withApiContext from "@/app/api/v0/withApiContext"
import { User } from "@/service/entity"
import { NextRequest, NextResponse } from "next/server"



const allowUserOrderBy = new Set(['emial', 'displayName', 'createdDatetime'])

/**
 * @swagger
 * /api/v0/adm/users:
 *   post:
 *     description: "Query multiple user's information with pagination."
 *     operationId: pri#queryUsers
 *     requestBody:
 *       description: 'Pagination information for the query'
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInfoQuery'
 *       required: true
 *     responses:
 *       200:
 *         description: "Successfully retrieve user info list in a page."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfoPage'
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
 *       - adm
 */
export async function POST(req: NextRequest, res: NextResponse) {
    return withApiContext(async ({ context }) => {
        const authToken = await validateAuthToken(req)
        const arg = await validateJson(req)
        const userInfoQuery: UserInfoQuery = await validateApiArgument(arg, UserInfoQuerySchema)

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

        const orderByFiled = userInfoQuery.orderBy?.field
        if (orderByFiled && !allowUserOrderBy.has(orderByFiled)) {
            return responseJson<CommonResponse>({ message: `Don't allow to order by '${orderByFiled}'`, error: true }, { status: 400 })
        }

        const orderBy = orderByFiled ? {
            field: orderByFiled as keyof User,
            desc: userInfoQuery.orderBy?.desc
        } : undefined

        const page = await userDao.page({ index: userInfoQuery.index, pageSize: userInfoQuery.pageSize, orderBy: orderBy })

        const userInfoPage: UserInfoPage = {
            index: page.index,
            totalItems: page.totalItems,
            totalPages: page.totalPages,
            numItems: page.numItems,
            pageSize: page.pageSize,
            content: page.content.map<UserInfo>((user) => {
                return {
                    email: user.email,
                    displayName: user.displayName,
                    loginCount: user.loginCount,
                    signedupDatetime: user.createdDatetime,
                    lastAccessDatetime: user.lastAccessDatetime
                }
            })
        }

        return responseJson<UserInfoPage>(userInfoPage)
    })
}