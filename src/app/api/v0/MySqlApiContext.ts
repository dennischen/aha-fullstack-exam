import { ActivationDao, AuthSessionDao, UserDao } from "@/service/dao"
import { ApiContext } from "."
import { Connection } from "mysql"
import mysql, { Pool, PoolConfig, PoolConnection } from 'mysql'
import { MysqlUserDao } from "@/service/impl/MysqlUserDao"
import { MysqlAuthSessionDao } from "@/service/impl/MysqlAuthSessionDao"
import { MysqlActivationDao } from "@/service/impl/MysqlActivationDao"
import { beginTransaction, commit, connect, end, rollback } from "@/service/impl/mysql-utils"

export type MySqlConfig = {
    host: string
    user: string
    password: string
    database: string
}

export default class MySqlApiContext implements ApiContext {

    private config: MySqlConfig

    //TODO use pool
    private connection: Connection | undefined

    private _hasTx: boolean | undefined

    constructor(config?: MySqlConfig) {
        this.config = config ?? {
            host: process.env.DB_MYSQL_HOST ?? '',
            user: process.env.DB_MYSQL_USER ?? '',
            password: process.env.DB_MYSQL_PASSWORD ?? '',
            database: process.env.DB_MYSQL_DATABASE ?? '',
        }
        console.log(">> MySqlApiContext init", this.config)
    }

    async getConnection(): Promise<Connection> {
        if (!this.connection) {
            const connection = mysql.createConnection(this.config)
            await connect(connection)
            this.connection = connection
            console.log(">>>> MySqlApiContext getConnection")
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

    async beginTx(): Promise<void> {
        if (!this._hasTx) {
            console.log(">>>> MySqlApiContext beginTx")
            await beginTransaction(await this.getConnection())
            this._hasTx = true
        }
    }

    hasTx(): boolean {
        return !!this._hasTx
    }

    async commit(): Promise<void> {
        if(this._hasTx){
            console.log(">>>> MySqlApiContext commit")
            await commit(await this.getConnection())
            this._hasTx = undefined
        }
    }

    async rollback(): Promise<void> {
        if(this._hasTx){
            console.log(">>>> MySqlApiContext rollback")
            await rollback(await this.getConnection())
            this._hasTx = undefined
        }
    }

    async release(): Promise<void> {

        console.log(">> MySqlApiContext release")

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