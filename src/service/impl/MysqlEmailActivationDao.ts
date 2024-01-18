import { EmailActivationDao, EmailActivationOrderBy, EmailActivationPagable, EmailActivationPage } from "@/service/dao"
import { EmailActivation, EmailActivationCreate, EmailActivationUpdate } from "@/service/entity"

import type { Connection, OkPacket } from 'mysql'
import { v4 as uuidv4 } from 'uuid'
import { query, toOrderByExpression } from "./mysql-utils"

const TABLE = 'AHA_EMAIL_ACTIVATION'


function wrapEmailActivationFromRowDataPacket(emailActivation: EmailActivation /*RowDataPacket*/) {
    return {
        uid: emailActivation.uid,
        userUid: emailActivation.userUid,
        token: emailActivation.token,
        createdDatetime: emailActivation.createdDatetime,
        activatedDatetime: emailActivation.activatedDatetime
    } as EmailActivation
}

export class MysqlEmailActivationDao implements EmailActivationDao {

    private connection: Connection

    constructor(connection: Connection) {
        this.connection = connection
    }

    async create(emailActivationCreate: EmailActivationCreate): Promise<EmailActivation> {

        const uid = uuidv4()
        const now = new Date().getTime();

        const emailActivation: EmailActivation = {
            uid: uid,
            userUid: emailActivationCreate.userUid,
            createdDatetime: now,
            token: emailActivationCreate.token,
        }

        await query(this.connection, `INSERT INTO ${TABLE} SET ?`, emailActivation)
        return this.get(uid)
    }

    async get(uid: string): Promise<EmailActivation> {
        const { results } = await query<EmailActivation[]>(this.connection, `SELECT * FROM ${TABLE} WHERE uid = ?`, [uid])

        if (results.length <= 0) {
            throw new Error(`EmailActivation ${uid} not found`)
        }

        return wrapEmailActivationFromRowDataPacket(results[0])
    }

    async findByToken(token: string): Promise<EmailActivation | undefined> {
        const { results } = await query<EmailActivation[]>(this.connection, `SELECT * FROM ${TABLE} WHERE token = ?`, [token])

        if (results.length <= 0) {
            return undefined
        }

        return wrapEmailActivationFromRowDataPacket(results[0])
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

    async list(orderBy: EmailActivationOrderBy | EmailActivationOrderBy[] = { field: 'createdDatetime' }): Promise<EmailActivation[]> {
        const orderByExpr = toOrderByExpression(orderBy)
        const { results } = await query<EmailActivation[]>(this.connection, `SELECT * FROM ${TABLE}${orderByExpr ? ` ORDER BY ${orderByExpr}` : ''}`)
        const emailActivations: EmailActivation[] = []
        for (const emailActivation of results) {
            emailActivations.push(wrapEmailActivationFromRowDataPacket(emailActivation))
        }
        return emailActivations
    }

    async update(uid: string, emailActivationUpdate: EmailActivationUpdate): Promise<EmailActivation> {
        // const oldEmailActivation = this.get(uid)

        const { activatedDatetime: activatedDatetime } = emailActivationUpdate
        const columns: string[] = []
        const values: any[] = []

        if (activatedDatetime !== undefined) {
            columns.push('activatedDatetime')
            values.push(activatedDatetime)
        }
       
        if (columns.length !== 0) {
            const { results } = await query<OkPacket>(this.connection, `UPDATE ${TABLE} SET ${columns.map((column) => `${column}=?`).join(",")} WHERE uid = ?`, [...values, uid],)
            // results.changedRows===1
        }

        return this.get(uid)

    }

    async page(pageable: EmailActivationPagable = {}): Promise<EmailActivationPage> {

        const index = pageable.index && pageable.index >= 0 ? pageable.index : 0
        const size = pageable.pageSize && pageable.pageSize > 0 ? pageable.pageSize : NaN
        const orderBy = pageable.orderBy ?? { field: 'createdDatetime' }

        if (isNaN(size)) {
            //only 1 page with total size
            if (index == 0) {
                const emailActivations = await this.list(orderBy)
                return {
                    index,
                    pageSize: emailActivations.length,
                    totalItems: emailActivations.length,
                    totalPages: 1,
                    numItems: emailActivations.length,
                    content: emailActivations
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
            const { results } = await query<EmailActivation[]>(this.connection, `SELECT * FROM ${TABLE}${orderByExpr ? ` ORDER BY ${orderByExpr}` : ''}${` LIMIT ${size} OFFSET ${index * size}`}`)
            const emailActivations: EmailActivation[] = []
            for (const emailActivation of results) {
                emailActivations.push(wrapEmailActivationFromRowDataPacket(emailActivation))
            }
            const totalItems = await this.count()
            const totalPages = (Math.floor(totalItems / size)) + (totalItems % size == 0 ? 0 : 1)

            return {
                index,
                pageSize: size,
                totalItems: totalItems,
                totalPages: totalPages,
                numItems: emailActivations.length,
                content: emailActivations
            }
        }
    }



}