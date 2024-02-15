/*
 * @author: Dennis Chen
 */

import { DailyActiveUserDao } from "@/service/dao"
import { DailyActiveUser, DailyActiveUserCreate, DailyActiveUserCreateSchema, DailyActiveUserUpdate, DailyActiveUserUpdateSchema } from "@/service/entity"

import { ServiceError } from "@/service"
import { validateServiceArgument } from "@/service/utils"
import type { Connection, OkPacket } from 'mysql'
import { query } from "./mysql-utils"

const TABLE = 'AHA_DAILY_ACTIVE_USER'


function wrapDailyActiveUserFromRowDataPacket(dailyActiveUser: DailyActiveUser /*RowDataPacket*/) {
    return {
        date: dailyActiveUser.date,
        count: dailyActiveUser.count,
        createdDatetime: dailyActiveUser.createdDatetime,
    } as DailyActiveUser
}

export class MysqlDailyActiveUserDao implements DailyActiveUserDao {

    private connection: Connection

    constructor(connection: Connection) {
        this.connection = connection
    }

    async create(dailyActiveUserCreate: DailyActiveUserCreate): Promise<DailyActiveUser> {

        dailyActiveUserCreate = await validateServiceArgument(dailyActiveUserCreate, DailyActiveUserCreateSchema)


        const now = new Date().getTime()

        const dailyactiveuser: DailyActiveUser = {
            date: dailyActiveUserCreate.date,
            count: dailyActiveUserCreate.count,
            createdDatetime: now,
        }

        await query(this.connection, `INSERT INTO ${TABLE} SET ?`, dailyactiveuser)
        return this.get(dailyActiveUserCreate.date)
    }

    async get(date: number): Promise<DailyActiveUser> {
        const { results } = await query<DailyActiveUser[]>(this.connection, `SELECT * FROM ${TABLE} WHERE date = ?`, [date])

        if (results.length <= 0) {
            throw new ServiceError(`DailyActiveUser ${date} not found`, 404)
        }

        return wrapDailyActiveUserFromRowDataPacket(results[0])
    }

    async delete(date: number): Promise<boolean> {

        const { results } = await query<OkPacket>(this.connection, `DELETE FROM ${TABLE} WHERE date = ?`, [date])

        return results.affectedRows !== 0
    }

    async deleteAll(): Promise<void> {
        await query<OkPacket>(this.connection, `DELETE FROM ${TABLE}`)
    }

    async count(): Promise<number> {
        const { results } = await query<{ count: number }[]>(this.connection, `SELECT COUNT(*) AS count FROM ${TABLE}`)

        return results[0].count
    }

    async list(dateStart: number, dateEnd: number): Promise<DailyActiveUser[]> {
        const { results } = await query<DailyActiveUser[]>(this.connection, `SELECT * FROM ${TABLE} WHERE date >= ? and date <= ? ORDER BY date ASC`,
            [Math.min(dateStart, dateEnd), Math.max(dateStart, dateEnd)])
        const dailyactiveusers: DailyActiveUser[] = []
        for (const dailyactiveuser of results) {
            dailyactiveusers.push(wrapDailyActiveUserFromRowDataPacket(dailyactiveuser))
        }
        return dailyactiveusers
    }

    async update(date: number, dailyactiveuserUpdate: DailyActiveUserUpdate): Promise<DailyActiveUser> {

        dailyactiveuserUpdate = await validateServiceArgument(dailyactiveuserUpdate, DailyActiveUserUpdateSchema)

        const { count } = dailyactiveuserUpdate
        const columns: string[] = []
        const values: any[] = []

        if (count !== undefined) {
            columns.push('count')
            values.push(count)
        }

        if (columns.length !== 0) {
            const { results } = await query<OkPacket>(this.connection, `UPDATE ${TABLE} SET ${columns.map((column) => `${column}=?`).join(",")} WHERE date = ?`, [...values, date],)
            // results.changedRows===1
        }

        return this.get(date)

    }
}