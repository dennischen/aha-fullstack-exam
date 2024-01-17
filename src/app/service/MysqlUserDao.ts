import { OrderBy, UserDao, UserOrderBy, UserPagable, UserPage } from "./dao"
import { UserCreate, User, UserUpdate } from "./model"

import type { Connection, OkPacket } from 'mysql'
import { query, toOrderByExpression } from "./mysql-utils"
import { v4 as uuidv4 } from 'uuid'

const TABLE = 'AHA_USER'


function wrapUserFromRowDataPacket(user: User /*RowDataPacket*/) {
    return {
        uid: user.uid,
        email: user.email,
        createdDatetime: user.createdDatetime,
        loginCount: user.loginCount,
        disabled: !!user.disabled,//bit -> boolean
        emailVerified: !!user.emailVerified,//bit -> boolean
        displayName: user.displayName,
        hashedPassword: user.hashedPassword
    } as User
}

export class MysqlUserDao implements UserDao {

    private connection: Connection

    constructor(connection: Connection) {
        this.connection = connection
    }

    async create(userCreate: UserCreate): Promise<User> {

        const uuid = uuidv4()

        const user: User = {
            uid: uuid,
            email: userCreate.email,
            createdDatetime: new Date().getTime(),
            loginCount: 0,
            disabled: userCreate.disabled ?? false,
            emailVerified: userCreate.emailVerified ?? false,
            displayName: userCreate.displayName,
            hashedPassword: userCreate.hashedPassword
        }

        await query(this.connection, `INSERT INTO ${TABLE} SET ?`, user)
        return user
    }

    async get(uid: string): Promise<User> {
        const { results } = await query<User[]>(this.connection, `SELECT * FROM ${TABLE} WHERE uid = ?`, [uid])

        if (results.length <= 0) {
            throw new Error(`User ${uid} not found`)
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

    async list(orderBy?: UserOrderBy | UserOrderBy[]): Promise<User[]> {
        const orderByExpr = toOrderByExpression(orderBy)
        const { results } = await query<User[]>(this.connection, `SELECT * FROM ${TABLE}${orderByExpr ? ` ${orderByExpr}` : ''}`)
        const users: User[] = []
        for (const user of results) {
            users.push(wrapUserFromRowDataPacket(user))
        }
        return users
    }


    page(pageable?: UserPagable): Promise<UserPage> {
        throw new Error("Method not implemented.")
    }

    async update(uid: string, userUpdate: UserUpdate): Promise<User> {
        throw new Error("Method not implemented.")
    }

}