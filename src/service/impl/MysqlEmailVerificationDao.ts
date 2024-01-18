import { EmailVerificationDao, EmailVerificationOrderBy, EmailVerificationPagable, EmailVerificationPage } from "@/service/dao"
import { EmailVerification, EmailVerificationCreate, EmailVerificationUpdate } from "@/service/entity"

import type { Connection, OkPacket } from 'mysql'
import { v4 as uuidv4 } from 'uuid'
import { query, toOrderByExpression } from "./mysql-utils"

const TABLE = 'AHA_EMAIL_VERIFICATION'


function wrapEmailVerificationFromRowDataPacket(emailVerification: EmailVerification /*RowDataPacket*/) {
    return {
        uid: emailVerification.uid,
        userUid: emailVerification.userUid,
        token: emailVerification.token,
        createdDatetime: emailVerification.createdDatetime,
        verifiedDatetime: emailVerification.verifiedDatetime
    } as EmailVerification
}

export class MysqlEmailVerificationDao implements EmailVerificationDao {

    private connection: Connection

    constructor(connection: Connection) {
        this.connection = connection
    }

    async create(emailVerificationCreate: EmailVerificationCreate): Promise<EmailVerification> {

        const uid = uuidv4()
        const now = new Date().getTime();

        const emailVerification: EmailVerification = {
            uid: uid,
            userUid: emailVerificationCreate.userUid,
            createdDatetime: now,
            token: emailVerificationCreate.token,
        }

        await query(this.connection, `INSERT INTO ${TABLE} SET ?`, emailVerification)
        return this.get(uid)
    }

    async get(uid: string): Promise<EmailVerification> {
        const { results } = await query<EmailVerification[]>(this.connection, `SELECT * FROM ${TABLE} WHERE uid = ?`, [uid])

        if (results.length <= 0) {
            throw new Error(`EmailVerification ${uid} not found`)
        }

        return wrapEmailVerificationFromRowDataPacket(results[0])
    }

    async findByToken(token: string): Promise<EmailVerification | undefined> {
        const { results } = await query<EmailVerification[]>(this.connection, `SELECT * FROM ${TABLE} WHERE token = ?`, [token])

        if (results.length <= 0) {
            return undefined
        }

        return wrapEmailVerificationFromRowDataPacket(results[0])
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

    async list(orderBy: EmailVerificationOrderBy | EmailVerificationOrderBy[] = { field: 'createdDatetime' }): Promise<EmailVerification[]> {
        const orderByExpr = toOrderByExpression(orderBy)
        const { results } = await query<EmailVerification[]>(this.connection, `SELECT * FROM ${TABLE}${orderByExpr ? ` ORDER BY ${orderByExpr}` : ''}`)
        const emailVerifications: EmailVerification[] = []
        for (const emailVerification of results) {
            emailVerifications.push(wrapEmailVerificationFromRowDataPacket(emailVerification))
        }
        return emailVerifications
    }

    async update(uid: string, emailVerificationUpdate: EmailVerificationUpdate): Promise<EmailVerification> {
        // const oldEmailVerification = this.get(uid)

        const { verifiedDatetime } = emailVerificationUpdate
        const columns: string[] = []
        const values: any[] = []

        if (verifiedDatetime !== undefined) {
            columns.push('verifiedDatetime')
            values.push(verifiedDatetime)
        }
       
        if (columns.length !== 0) {
            const { results } = await query<OkPacket>(this.connection, `UPDATE ${TABLE} SET ${columns.map((column) => `${column}=?`).join(",")} WHERE uid = ?`, [...values, uid],)
            // results.changedRows===1
        }

        return this.get(uid)

    }

    async page(pageable: EmailVerificationPagable = {}): Promise<EmailVerificationPage> {

        const index = pageable.index && pageable.index >= 0 ? pageable.index : 0
        const size = pageable.size && pageable.size > 0 ? pageable.size : NaN
        const orderBy = pageable.orderBy ?? { field: 'createdDatetime' }

        if (isNaN(size)) {
            //only 1 page with total size
            if (index == 0) {
                const emailVerifications = await this.list(orderBy)
                return {
                    index,
                    size: emailVerifications.length,
                    totalItem: emailVerifications.length,
                    total: 1,
                    items: emailVerifications
                }
            } else {
                const count = await this.count()
                return {
                    index,
                    size: count,
                    totalItem: count,
                    total: 1,
                    items: []
                }
            }
        } else {
            const orderByExpr = toOrderByExpression(orderBy)
            const { results } = await query<EmailVerification[]>(this.connection, `SELECT * FROM ${TABLE}${orderByExpr ? ` ORDER BY ${orderByExpr}` : ''}${` LIMIT ${size} OFFSET ${index * size}`}`)
            const emailVerifications: EmailVerification[] = []
            for (const emailVerification of results) {
                emailVerifications.push(wrapEmailVerificationFromRowDataPacket(emailVerification))
            }
            const totalItem = await this.count()
            const totalPage = (Math.floor(totalItem / size)) + (totalItem % size == 0 ? 0 : 1)

            return {
                index,
                size,
                totalItem,
                total: totalPage,
                items: emailVerifications
            }
        }
    }



}