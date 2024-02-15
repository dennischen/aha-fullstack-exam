
/*
 * @author: Dennis Chen
 */

import { ActivationDao, AuthSessionDao, DailyActiveUserDao, UserDao } from "@/service/dao"
import { MysqlActivationDao } from "@/service/impl/MysqlActivationDao"
import { MysqlAuthSessionDao } from "@/service/impl/MysqlAuthSessionDao"
import { MysqlUserDao } from "@/service/impl/MysqlUserDao"
import { beginTransaction, commit, connect, end, rollback } from "@/service/impl/mysql-utils"
import mysql, { Connection } from 'mysql'
import { ServiceContext } from "."
import { MysqlDailyActiveUserDao } from "./impl/MysqlDailyActiveUserDao"

export type MySqlConfig = {
    host: string
    user: string
    password: string
    database: string
}

export default class MySqlApiContext implements ServiceContext {

    private config: MySqlConfig

    //TODO use connection pool
    private connection: Connection | undefined

    private _hasTx: boolean | undefined

    constructor(config?: MySqlConfig) {
        this.config = config ?? {
            host: process.env.DB_MYSQL_HOST ?? '',
            user: process.env.DB_MYSQL_USER ?? '',
            password: process.env.DB_MYSQL_PASSWORD ?? '',
            database: process.env.DB_MYSQL_DATABASE ?? '',
        }
    }

    async getConnection(): Promise<Connection> {
        if (!this.connection) {
            const connection = mysql.createConnection(this.config)
            await connect(connection)
            this.connection = connection
        }
        return this.connection!
    }

    async getUserDao(): Promise<UserDao> {
        return new MysqlUserDao(await this.getConnection())
    }

    async getAuthSessionDao(): Promise<AuthSessionDao> {
        return new MysqlAuthSessionDao(await this.getConnection())
    }

    async getActivationDao(): Promise<ActivationDao> {
        return new MysqlActivationDao(await this.getConnection())
    }

    async getDailyActiveUserDao(): Promise<DailyActiveUserDao> {
        return new MysqlDailyActiveUserDao(await this.getConnection())
    }

    async beginTx(): Promise<void> {
        if (!this._hasTx) {
            await beginTransaction(await this.getConnection())
            this._hasTx = true
        }
    }

    hasTx(): boolean {
        return !!this._hasTx
    }

    async commit(): Promise<void> {
        if (this._hasTx) {
            await commit(await this.getConnection())
            this._hasTx = undefined
        }
    }

    async rollback(): Promise<void> {
        if (this._hasTx) {
            await rollback(await this.getConnection())
            this._hasTx = undefined
        }
    }

    async release(): Promise<void> {

        if (this.connection) {
            if (this._hasTx) {
                //for someone doesnot commit or rollback in tx mode
                console.warn('transaction will release without commit or rollback')
            }
            await end(this.connection)
            this.connection = undefined
        }
    }
}