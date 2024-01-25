/*
 * @author: Dennis Chen
 */

import { ActivationDao, ActivationOrderBy, ActivationPagable, ActivationPage, PageableSchema } from "@/service/dao"
import { Activation, ActivationCreate, ActivationCreateSchema, ActivationUpdate, ActivationUpdateSchema } from "@/service/entity"

import { validateServiceArgument } from "@/service/utils"
import type { Connection, OkPacket } from 'mysql'
import { v4 as uuidv4 } from 'uuid'
import { query, toOrderByExpression } from "./mysql-utils"
import { ServiceError } from "@/service"

const TABLE = 'AHA_ACTIVATION'


function wrapActivationFromRowDataPacket(activation: Activation /*RowDataPacket*/) {
    return {
        uid: activation.uid,
        userUid: activation.userUid,
        token: activation.token,
        createdDatetime: activation.createdDatetime,
        activatedDatetime: activation.activatedDatetime
    } as Activation
}

export class MysqlActivationDao implements ActivationDao {

    private connection: Connection

    constructor(connection: Connection) {
        this.connection = connection
    }

    async create(activationCreate: ActivationCreate): Promise<Activation> {

        activationCreate = await validateServiceArgument(activationCreate, ActivationCreateSchema)

        const uid = uuidv4()
        const now = new Date().getTime()

        const activation: Activation = {
            uid: uid,
            userUid: activationCreate.userUid,
            createdDatetime: now,
            token: activationCreate.token,
        }

        await query(this.connection, `INSERT INTO ${TABLE} SET ?`, activation)
        return this.get(uid)
    }

    async get(uid: string): Promise<Activation> {
        const { results } = await query<Activation[]>(this.connection, `SELECT * FROM ${TABLE} WHERE uid = ?`, [uid])

        if (results.length <= 0) {
            throw new ServiceError(`Activation ${uid} not found`, 404)
        }

        return wrapActivationFromRowDataPacket(results[0])
    }

    async findByToken(token: string): Promise<Activation | undefined> {
        const { results } = await query<Activation[]>(this.connection, `SELECT * FROM ${TABLE} WHERE token = ?`, [token])

        if (results.length <= 0) {
            return undefined
        }

        return wrapActivationFromRowDataPacket(results[0])
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

    async list(orderBy: ActivationOrderBy | ActivationOrderBy[] = { field: 'createdDatetime' }): Promise<Activation[]> {
        const orderByExpr = toOrderByExpression(orderBy)
        const { results } = await query<Activation[]>(this.connection, `SELECT * FROM ${TABLE}${orderByExpr ? ` ORDER BY ${orderByExpr}` : ''}`)
        const activations: Activation[] = []
        for (const activation of results) {
            activations.push(wrapActivationFromRowDataPacket(activation))
        }
        return activations
    }

    async update(uid: string, activationUpdate: ActivationUpdate): Promise<Activation> {

        activationUpdate = await validateServiceArgument(activationUpdate, ActivationUpdateSchema)

        const { activatedDatetime } = activationUpdate
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

    async page(pageable: ActivationPagable = {}): Promise<ActivationPage> {

        pageable = await validateServiceArgument(pageable, PageableSchema)

        const index = pageable.index && pageable.index >= 0 ? pageable.index : 0
        const size = pageable.pageSize && pageable.pageSize > 0 ? pageable.pageSize : NaN
        const orderBy = pageable.orderBy ?? { field: 'createdDatetime' }

        if (isNaN(size)) {
            //only 1 page with total size
            if (index == 0) {
                const activations = await this.list(orderBy)
                return {
                    index,
                    pageSize: activations.length,
                    totalItems: activations.length,
                    totalPages: 1,
                    numItems: activations.length,
                    content: activations
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
            const { results } = await query<Activation[]>(this.connection, `SELECT * FROM ${TABLE}${orderByExpr ? ` ORDER BY ${orderByExpr}` : ''}${` LIMIT ${size} OFFSET ${index * size}`}`)
            const activations: Activation[] = []
            for (const activation of results) {
                activations.push(wrapActivationFromRowDataPacket(activation))
            }
            const totalItems = await this.count()
            const totalPages = (Math.floor(totalItems / size)) + (totalItems % size == 0 ? 0 : 1)

            return {
                index,
                pageSize: size,
                totalItems: totalItems,
                totalPages: totalPages,
                numItems: activations.length,
                content: activations
            }
        }
    }



}