/*
 * @author: Dennis Chen
 */

import { MysqlDailyActiveUserDao } from '@/service/impl/MysqlDailyActiveUserDao'
import { getConnection, query as mysqlQuery } from '@/service/impl/mysql-utils'
import fs from 'fs'
import mysql, { Pool, PoolConfig, PoolConnection } from 'mysql'
import path from 'path'

const host = process.env.JEST_MYSQL_HOST
const user = process.env.JEST_MYSQL_USER
const password = process.env.JEST_MYSQL_PASSWORD
const database = process.env.JEST_MYSQL_DATABASE



if (!host || !user || !database) {
    describe('No Db Config', () => {
        it('will ignore this test because of lack of database config', () => {
            console.log(host, user, database)
        })
    })
} else {
    const poolConfig: PoolConfig = {
        host: host,
        user: user,
        password: password,
        database: database,
    }


    let pool: Pool | undefined
    let connection: PoolConnection | undefined

    beforeAll(async () => {
        pool = mysql.createPool(poolConfig)

        const connection = await getConnection(pool)

        const dropSql = fs.readFileSync(path.resolve(__dirname, 'mysql-drop.sql'), 'utf8')
        const dropQueries = dropSql.split(";").map((query) => query.trim()).filter((query) => query)

        for (const query of dropQueries) {
            await mysqlQuery(connection, query)
        }

        const createSql = fs.readFileSync(path.resolve(__dirname, 'mysql-create.sql'), 'utf8')
        const createQueries = createSql.split(";").map((query) => query.trim()).filter((query) => query)
        for (const query of createQueries) {
            await mysqlQuery(connection, query)
        }

        connection.release()

    })

    afterAll(async () => {
        pool!.end()
        pool = undefined
    })

    beforeEach(async () => {
        connection = await getConnection(pool!)
    })

    afterEach(async () => {
        connection!.release()
        connection = undefined
    })


    describe('Test Database RAW Query', () => {
        it('should query table correctly with empty data', async () => {

            let { results: result1 } = await mysqlQuery<any[]>(connection!, 'SELECT * FROM AHA_DAILY_ACTIVE_USER')

            expect(result1.length).toBe(0)
        })
    })

    describe('Test DailyActiveUser Dao', () => {

        it('should create/delete DailyActiveUser correctly', async () => {

            
            const dailyActiveUserDao = new MysqlDailyActiveUserDao(connection!)

            expect(await dailyActiveUserDao.count()).toEqual(0)

            const dailyActiveUser = await dailyActiveUserDao.create({
                date: 20240101, 
                count: 10
            })
            expect(dailyActiveUser).toBeTruthy()

            let {
                date,
                count,
                createdDatetime,
            } = dailyActiveUser

            expect(date).toEqual(dailyActiveUser.date)
            expect(count).toEqual(10)
            expect(createdDatetime).toBeTruthy()

            expect(await dailyActiveUserDao.count()).toEqual(1)

            const dailyactiveuser1 = await dailyActiveUserDao.get(dailyActiveUser.date)
            expect(dailyactiveuser1).toBeTruthy()

            expect(dailyactiveuser1.date).toEqual(date)
            expect(dailyactiveuser1.count).toEqual(count)
            expect(dailyactiveuser1.createdDatetime).toEqual(createdDatetime)

            expect(dailyactiveuser1).toEqual(dailyActiveUser)


            try {
                const dailyActiveUser2 = await dailyActiveUserDao.get(20000101)
                fail("should get error")
            } catch (err: any) {
                
            }



            const deleted = await dailyActiveUserDao.delete(dailyActiveUser.date)
            expect(deleted).toBeTruthy()

            const deleted2 = await dailyActiveUserDao.delete(20220101)
            expect(deleted2).not.toBeTruthy()

            expect(await dailyActiveUserDao.count()).toEqual(0)

        })

        it('should create/delete multiple DailyActiveUsers correctly', async () => {

            const dailyActiveUserDao = new MysqlDailyActiveUserDao(connection!)

            expect(await dailyActiveUserDao.count()).toEqual(0)

            //create 3 then delete all

            const dailyActiveUser1 = await dailyActiveUserDao.create({
                date: 20240101,
                count: 10
            })
            const dailyActiveUser2 = await dailyActiveUserDao.create({
                date: 20240103,
                count: 20
            })
            const dailyActiveUser3 = await dailyActiveUserDao.create({
                date: 20240102,
                count: 30
            })

            expect(await dailyActiveUserDao.count()).toEqual(3)


            let dailyActiveUser = await dailyActiveUserDao.get(dailyActiveUser1.date)
            expect(dailyActiveUser).toEqual(dailyActiveUser1)
            expect(dailyActiveUser).not.toEqual(dailyActiveUser2)
            expect(dailyActiveUser).not.toEqual(dailyActiveUser3)

            dailyActiveUser = await dailyActiveUserDao.get(dailyActiveUser2.date)
            expect(dailyActiveUser).not.toEqual(dailyActiveUser1)
            expect(dailyActiveUser).toEqual(dailyActiveUser2)
            expect(dailyActiveUser).not.toEqual(dailyActiveUser3)

            dailyActiveUser = await dailyActiveUserDao.get(dailyActiveUser3.date)
            expect(dailyActiveUser).not.toEqual(dailyActiveUser1)
            expect(dailyActiveUser).not.toEqual(dailyActiveUser2)
            expect(dailyActiveUser).toEqual(dailyActiveUser3)


            //test list
            let dailyActiveUsers = await dailyActiveUserDao.list(20240101, 20240103)
            expect(dailyActiveUsers.length).toEqual(3)

            expect(dailyActiveUsers[0]).toEqual(dailyActiveUser1)
            expect(dailyActiveUsers[1]).toEqual(dailyActiveUser3)
            expect(dailyActiveUsers[2]).toEqual(dailyActiveUser2)


            dailyActiveUsers = await dailyActiveUserDao.list(20240102, 20240103)
            expect(dailyActiveUsers.length).toEqual(2)

            expect(dailyActiveUsers[0]).toEqual(dailyActiveUser3)
            expect(dailyActiveUsers[1]).toEqual(dailyActiveUser2)

            dailyActiveUsers = await dailyActiveUserDao.list(20240102, 20240101)
            expect(dailyActiveUsers.length).toEqual(2)

            expect(dailyActiveUsers[0]).toEqual(dailyActiveUser1)
            expect(dailyActiveUsers[1]).toEqual(dailyActiveUser3)


            //test delete all
            await dailyActiveUserDao.deleteAll()

            dailyActiveUsers = await dailyActiveUserDao.list(0, 20241231)
            expect(dailyActiveUsers.length).toEqual(0)

            expect(await dailyActiveUserDao.count()).toEqual(0)

        })

        it('should update a DailyActiveUser correctly', async () => {

            const dailyActiveUserDao = new MysqlDailyActiveUserDao(connection!)

            expect(await dailyActiveUserDao.count()).toEqual(0)


            const dailyActiveUser1 = await dailyActiveUserDao.create({
                date: 20240214,
                count: 0
            })


            const dailyActiveUser2 = await dailyActiveUserDao.create({
                date: 20240215,
                count: 33
            })

            let dailyActiveUser = await dailyActiveUserDao.get(dailyActiveUser1.date)
            expect(dailyActiveUser).toEqual(dailyActiveUser1)
            dailyActiveUser = await dailyActiveUserDao.get(dailyActiveUser2.date)
            expect(dailyActiveUser).toEqual(dailyActiveUser2)

            dailyActiveUser = await dailyActiveUserDao.update(dailyActiveUser1.date, {
            })
            expect(dailyActiveUser).toEqual(dailyActiveUser1)

            dailyActiveUser = await dailyActiveUserDao.update(dailyActiveUser1.date, {
                count: 4
            })
            expect(dailyActiveUser).not.toEqual(dailyActiveUser1)
            expect(dailyActiveUser.date).toEqual(dailyActiveUser1.date)
            expect(dailyActiveUser.createdDatetime).toEqual(dailyActiveUser1.createdDatetime)
            expect(dailyActiveUser.count).toEqual(4)


            dailyActiveUser = await dailyActiveUserDao.update(dailyActiveUser1.date, {
                count: 9999
            })
            expect(dailyActiveUser).not.toEqual(dailyActiveUser1)
            expect(dailyActiveUser.createdDatetime).toEqual(dailyActiveUser1.createdDatetime)
            expect(dailyActiveUser.count).toEqual(9999)


            let dailyActiveUserX = await dailyActiveUserDao.get(dailyActiveUser1.date)
            expect(dailyActiveUserX).toEqual(dailyActiveUser)
            expect(dailyActiveUserX).not.toEqual(dailyActiveUser1)

            dailyActiveUserX = await dailyActiveUserDao.get(dailyActiveUser2.date)
            expect(dailyActiveUserX).toEqual(dailyActiveUser2)

            //clean up
            await dailyActiveUserDao.deleteAll()
            expect(await dailyActiveUserDao.count()).toEqual(0)

        })
    })
}