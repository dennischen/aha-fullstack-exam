/*
 * @author: Dennis Chen
 */

import { AuthSessionDao, AuthSessionOrderBy, AuthSessionPagable, AuthSessionPage, PageableSchema } from "@/service/dao"
import { AuthSession, AuthSessionCreate, AuthSessionCreateSchema, AuthSessionUpdate, AuthSessionUpdateSchema } from "@/service/entity"

import { validateServiceArgument } from "@/service/utils"
import type { Connection, OkPacket } from 'mysql'
import { v4 as uuidv4 } from 'uuid'
import { query, toOrderByExpression } from "./mysql-utils"
import { ServiceError } from "@/service"

const TABLE = 'AHA_AUTH_SESSION'


function wrapAuthSessionFromRowDataPacket(authSession: AuthSession /*RowDataPacket*/) {
    const o: AuthSession = {
        uid: authSession.uid,
        userUid: authSession.userUid,
        token: authSession.token,
        createdDatetime: authSession.createdDatetime,
        invalid: !!authSession.invalid,//bit -> boolean
        lastAccessDatetime: authSession.lastAccessDatetime ?? undefined,
        signinDomain: authSession.signinDomain ?? undefined
    }
    return o;
}

export class MysqlAuthSessionDao implements AuthSessionDao {

    private connection: Connection

    constructor(connection: Connection) {
        this.connection = connection
    }

    async create(authSessionCreate: AuthSessionCreate): Promise<AuthSession> {

        authSessionCreate = await validateServiceArgument(authSessionCreate, AuthSessionCreateSchema)

        const uid = uuidv4()
        const now = new Date().getTime()

        const authSession: AuthSession = {
            uid: uid,
            userUid: authSessionCreate.userUid,
            createdDatetime: now,
            lastAccessDatetime: now,
            token: authSessionCreate.token,
            signinDomain: authSessionCreate.signinDomain,
            invalid: false
        }

        await query(this.connection, `INSERT INTO ${TABLE} SET ?`, authSession)
        return this.get(uid)
    }

    async get(uid: string): Promise<AuthSession> {
        const { results } = await query<AuthSession[]>(this.connection, `SELECT * FROM ${TABLE} WHERE uid = ?`, [uid])

        if (results.length <= 0) {
            throw new ServiceError(`AuthSession ${uid} not found`, 404)
        }

        return wrapAuthSessionFromRowDataPacket(results[0])
    }

    async findByToken(token: string): Promise<AuthSession | undefined> {
        const { results } = await query<AuthSession[]>(this.connection, `SELECT * FROM ${TABLE} WHERE token = ?`, [token])

        if (results.length <= 0) {
            return undefined
        }

        return wrapAuthSessionFromRowDataPacket(results[0])
    }

    async delete(uid: string): Promise<boolean> {

        const { results } = await query<OkPacket>(this.connection, `DELETE FROM ${TABLE} WHERE uid = ?`, [uid])

        return results.affectedRows !== 0
    }

    async deleteAll(): Promise<void> {
        await query<OkPacket>(this.connection, `DELETE FROM ${TABLE}`)
    }

    async count(): Promise<number> {
        const { results } = await query<{ count: number }[]>(this.connection, `SELECT COUNT(*) AS count FROM ${TABLE}`)

        return results[0].count
    }

    async countActiveUserBetween(start: number, end: number): Promise<number> {
        const { results } = await query<{ count: number }[]>(this.connection, `SELECT count(distinct userUid) AS count FROM ${TABLE} WHERE lastAccessDateTime <= ? AND lastAccessDateTime >= ?`,
            [Math.max(start, end), Math.min(start, end)])

        return results[0].count
    }


    async list(orderBy: AuthSessionOrderBy | AuthSessionOrderBy[] = { field: 'createdDatetime' }): Promise<AuthSession[]> {
        const orderByExpr = toOrderByExpression(orderBy)
        const { results } = await query<AuthSession[]>(this.connection, `SELECT * FROM ${TABLE}${orderByExpr ? ` ORDER BY ${orderByExpr}` : ''}`)
        const authSessions: AuthSession[] = []
        for (const authSession of results) {
            authSessions.push(wrapAuthSessionFromRowDataPacket(authSession))
        }
        return authSessions
    }

    async update(uid: string, authSessionUpdate: AuthSessionUpdate): Promise<AuthSession> {

        authSessionUpdate = await validateServiceArgument(authSessionUpdate, AuthSessionUpdateSchema)

        const { lastAccessDatetime, invalid } = authSessionUpdate
        const columns: string[] = []
        const values: any[] = []

        if (lastAccessDatetime !== undefined) {
            columns.push('lastAccessDatetime')
            values.push(lastAccessDatetime)
        }
        if (invalid !== undefined) {
            columns.push('invalid')
            values.push(invalid)
        }
        if (columns.length !== 0) {
            const { results } = await query<OkPacket>(this.connection, `UPDATE ${TABLE} SET ${columns.map((column) => `${column}=?`).join(",")} WHERE uid = ?`, [...values, uid],)
            // results.changedRows===1
        }

        return this.get(uid)

    }

    async page(pageable: AuthSessionPagable = {}): Promise<AuthSessionPage> {

        pageable = await validateServiceArgument(pageable, PageableSchema)

        const index = pageable.index && pageable.index >= 0 ? pageable.index : 0
        const size = pageable.pageSize && pageable.pageSize > 0 ? pageable.pageSize : NaN
        const orderBy = pageable.orderBy ?? { field: 'createdDatetime' }

        if (isNaN(size)) {
            //only 1 page with total size
            if (index == 0) {
                const authSessions = await this.list(orderBy)
                return {
                    index,
                    pageSize: authSessions.length,
                    totalItems: authSessions.length,
                    totalPages: 1,
                    numItems: authSessions.length,
                    content: authSessions
                }
            } else {
                const count = await this.count()
                return {
                    index,
                    pageSize: count,
                    totalItems: count,
                    totalPages: 1,
                    numItems: 0,
                    content: []
                }
            }
        } else {
            const orderByExpr = toOrderByExpression(orderBy)
            const { results } = await query<AuthSession[]>(this.connection, `SELECT * FROM ${TABLE}${orderByExpr ? ` ORDER BY ${orderByExpr}` : ''}${` LIMIT ${size} OFFSET ${index * size}`}`)
            const authSessions: AuthSession[] = []
            for (const authSession of results) {
                authSessions.push(wrapAuthSessionFromRowDataPacket(authSession))
            }
            const totalItem = await this.count()
            const totalPage = (Math.floor(totalItem / size)) + (totalItem % size == 0 ? 0 : 1)

            return {
                index,
                pageSize: size,
                totalItems: totalItem,
                totalPages: totalPage,
                numItems: authSessions.length,
                content: authSessions
            }
        }
    }



}