/*
 * @author: Dennis Chen
 */

import { PageableSchema, UserDao, UserOrderBy, UserPagable, UserPage } from "@/service/dao"
import { User, UserCreate, UserCreateSchema, UserUpdate, UserUpdateSchema } from "@/service/entity"
import { validateServiceArgument } from "@/service/utils"

import { ServiceError } from "@/service"
import type { Connection, OkPacket } from 'mysql'
import { v4 as uuidv4 } from 'uuid'
import { query, toOrderByExpression } from "./mysql-utils"

const TABLE = 'AHA_USER'

function wrapUserFromRowDataPacket(user: User /*RowDataPacket*/) {
    const o: User = {
        uid: user.uid,
        email: user.email,
        createdDatetime: user.createdDatetime,
        loginCount: user.loginCount,
        disabled: !!user.disabled,//bit -> boolean
        activated: !!user.activated,//bit -> boolean
        displayName: user.displayName,
        hashedPassword: user.hashedPassword,
        lastAccessDatetime: user.lastAccessDatetime ?? undefined,
        signupDomain: user.signupDomain ?? undefined
    }
    return o
}

export class MysqlUserDao implements UserDao {

    private connection: Connection

    constructor(connection: Connection) {
        this.connection = connection
    }

    async create(userCreate: UserCreate): Promise<User> {

        userCreate = await validateServiceArgument(userCreate, UserCreateSchema)

        const uid = uuidv4()

        const user: User = {
            uid: uid,
            email: userCreate.email,
            createdDatetime: new Date().getTime(),
            loginCount: 0,
            disabled: userCreate.disabled ?? false,
            activated: userCreate.activated ?? false,
            displayName: userCreate.displayName,
            hashedPassword: userCreate.hashedPassword,
            signupDomain: userCreate.signupDomain,
            lastAccessDatetime: undefined
        }

        await query(this.connection, `INSERT INTO ${TABLE} SET ?`, user)
        return this.get(uid)
    }

    async get(uid: string): Promise<User> {
        const { results } = await query<User[]>(this.connection, `SELECT * FROM ${TABLE} WHERE uid = ?`, [uid])

        if (results.length <= 0) {
            throw new ServiceError(`User ${uid} not found`, 404)
        }

        return wrapUserFromRowDataPacket(results[0])
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const { results } = await query<User[]>(this.connection, `SELECT * FROM ${TABLE} WHERE LOWER(email) = LOWER(?)`, [email])

        if (results.length <= 0) {
            return undefined
        }

        return wrapUserFromRowDataPacket(results[0])
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

    async list(orderBy: UserOrderBy | UserOrderBy[] = { field: 'createdDatetime' }): Promise<User[]> {
        const orderByExpr = toOrderByExpression(orderBy)
        const { results } = await query<User[]>(this.connection, `SELECT * FROM ${TABLE}${orderByExpr ? ` ORDER BY ${orderByExpr}` : ''}`)
        const users: User[] = []
        for (const user of results) {
            users.push(wrapUserFromRowDataPacket(user))
        }
        return users
    }

    async update(uid: string, userUpdate: UserUpdate): Promise<User> {

        userUpdate = await validateServiceArgument(userUpdate, UserUpdateSchema)

        const { disabled, displayName, activated, hashedPassword, lastAccessDatetime, loginCount } = userUpdate
        const columns: string[] = []
        const values: any[] = []

        if (disabled !== undefined) {
            columns.push('disabled')
            values.push(disabled)
        }
        if (displayName !== undefined) {
            columns.push('displayName')
            values.push(displayName)
        }
        if (activated !== undefined) {
            columns.push('activated')
            values.push(activated)
        }
        if (hashedPassword !== undefined) {
            columns.push('hashedPassword')
            values.push(hashedPassword)
        }
        if (lastAccessDatetime !== undefined) {
            columns.push('lastAccessDatetime')
            values.push(lastAccessDatetime)
        }
        if (loginCount !== undefined) {
            columns.push('loginCount')
            values.push(loginCount)
        }
        if (columns.length !== 0) {
            const { results } = await query<OkPacket>(this.connection, `UPDATE ${TABLE} SET ${columns.map((column) => `${column}=?`).join(",")} WHERE uid = ?`, [...values, uid],)
            // results.changedRows===1
        }

        return this.get(uid)

    }

    async page(pageable: UserPagable = {}): Promise<UserPage> {

        pageable = await validateServiceArgument(pageable, PageableSchema)

        const index = pageable.index && pageable.index >= 0 ? pageable.index : 0
        const size = pageable.pageSize && pageable.pageSize > 0 ? pageable.pageSize : NaN
        const orderBy = pageable.orderBy ?? { field: 'createdDatetime' }

        if (isNaN(size)) {
            //only 1 page with total size
            if (index == 0) {
                const users = await this.list(orderBy)
                return {
                    index,
                    pageSize: users.length,
                    totalItems: users.length,
                    totalPages: 1,
                    numItems: users.length,
                    content: users
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
            const { results } = await query<User[]>(this.connection, `SELECT * FROM ${TABLE}${orderByExpr ? ` ORDER BY ${orderByExpr}` : ''}${` LIMIT ${size} OFFSET ${index * size}`}`)
            const users: User[] = []
            for (const user of results) {
                users.push(wrapUserFromRowDataPacket(user))
            }
            const totalItems = await this.count()
            const totalPages = (Math.floor(totalItems / size)) + (totalItems % size == 0 ? 0 : 1)

            return {
                index,
                pageSize: size,
                totalItems: totalItems,
                totalPages: totalPages,
                numItems: users.length,
                content: users
            }
        }

    }



}