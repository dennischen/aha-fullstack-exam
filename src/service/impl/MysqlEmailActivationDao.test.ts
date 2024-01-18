import { MysqlEmailActivationDao } from '@/service/impl/MysqlEmailActivationDao'
import { getConnection, query as mysqlQuery } from '@/service/impl/mysql-utils'
import fs from 'fs'
import path from 'path'
import mysql, { Pool, PoolConfig, PoolConnection } from 'mysql'
import { MysqlUserDao } from './MysqlUserDao'

const host = process.env.JEST_MYSQL_HOST
const user = process.env.JEST_MYSQL_USER
const password = process.env.JEST_MYSQL_PASSWORD
const database = process.env.JEST_MYSQL_DATABASE



if (!host || !user || !password || !database) {
    describe('No Db Config', () => {
        it('will ignore this test because of lack of database config', () => {
            console.log(host, user, password, database)
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
        it('should query 3 table correctly with empty data', async () => {

            let { results: result1 } = await mysqlQuery<any[]>(connection!, 'SELECT * FROM AHA_USER')
            let { results: result2 } = await mysqlQuery<any[]>(connection!, 'SELECT * FROM AHA_AUTH_SESSION')
            let { results: result3 } = await mysqlQuery<any[]>(connection!, 'SELECT * FROM AHA_EMAIL_ACTIVATION')

            expect(result1.length).toBe(0)
            expect(result2.length).toBe(0)
            expect(result3.length).toBe(0)
        })
    })

    describe('Test EmailActivation Dao', () => {

        it('should create/delete a emailActivation correctly', async () => {

            const userDao = new MysqlUserDao(connection!)
            const user = await userDao.create({
                email: 'atticcat@gmail.com',
                displayName: 'Dennis',
                hashedPassword: '123454'
            })
            
            const emailActivationDao = new MysqlEmailActivationDao(connection!)

            let count = await emailActivationDao.count()

            expect(count).toEqual(0)

            const emailActivation = await emailActivationDao.create({
                userUid: user.uid,
                token : 'abcdef'
            })
            expect(emailActivation).toBeTruthy()

            let {
                uid,
                userUid,
                createdDatetime,
                activatedDatetime,
                token
            } = emailActivation

            expect(uid).toBeTruthy()
            expect(userUid).toEqual(user.uid)
            expect(token).toEqual('abcdef')
            expect(createdDatetime).toBeTruthy()
            expect(activatedDatetime).not.toBeTruthy()

            count = await emailActivationDao.count()
            expect(count).toEqual(1)

            const emailActivation1 = await emailActivationDao.get(emailActivation.uid)
            expect(emailActivation1).toBeTruthy()

            expect(emailActivation1.uid).toEqual(uid)
            expect(emailActivation1.userUid).toEqual(userUid)
            expect(emailActivation1.token).toEqual(token)
            expect(emailActivation1.createdDatetime).toEqual(createdDatetime)
            expect(emailActivation1.activatedDatetime).toEqual(activatedDatetime)

            expect(emailActivation1).toEqual(emailActivation)


            try {
                const emailActivation2 = await emailActivationDao.create({
                    userUid: 'nosuchuser',
                    token : 'anewtoken'
                })
                fail("should get error")
            } catch (err: any) {
                console.log(err.message)
            }


            try {
                const emailActivation2 = await emailActivationDao.get('nosuchid')
                fail("should get error")
            } catch (err: any) {
                console.log("catched error", err.message)
            }

            const emailActivation2 = await emailActivationDao.findByToken('abcdef')

            expect(emailActivation2).toBeTruthy()

            expect(emailActivation2!.uid).toEqual(uid)
            expect(emailActivation2!.userUid).toEqual(userUid)
            expect(emailActivation2!.token).toEqual(token)
            expect(emailActivation2!.createdDatetime).toEqual(createdDatetime)
            expect(emailActivation2!.activatedDatetime).toEqual(activatedDatetime)

            expect(emailActivation2).toEqual(emailActivation)

            const emailActivation3 = await emailActivationDao.findByToken('nosuchtoken')

            expect(emailActivation3).not.toBeTruthy()


            const deleted = await emailActivationDao.delete(emailActivation.uid)
            expect(deleted).toBeTruthy()

            const deleted2 = await emailActivationDao.delete('nosuchid')
            expect(deleted2).not.toBeTruthy()

            count = await emailActivationDao.count()
            expect(count).toEqual(0)

            await userDao.delete(user.uid)
        })

        it('should create/delete multiple emailActivations correctly', async () => {

            const userDao = new MysqlUserDao(connection!)
            const user = await userDao.create({
                email: 'atticcat@gmail.com',
                displayName: 'Dennis',
                hashedPassword: '123454'
            })

            const emailActivationDao = new MysqlEmailActivationDao(connection!)

            let count = await emailActivationDao.count()
            expect(count).toEqual(0)

            //create 3 then delete all

            const emailActivation1 = await emailActivationDao.create({
                userUid: user.uid,
                token : 'abcdef1'
            })
            const emailActivation2 = await emailActivationDao.create({
                userUid: user.uid,
                token : 'abcdef2'
            })
            const emailActivation3 = await emailActivationDao.create({
                userUid: user.uid,
                token : 'abcdef3'
            })

            count = await emailActivationDao.count()
            expect(count).toEqual(3)


            let emailActivation = await emailActivationDao.get(emailActivation1.uid)
            expect(emailActivation).toEqual(emailActivation1)
            expect(emailActivation).not.toEqual(emailActivation2)
            expect(emailActivation).not.toEqual(emailActivation3)

            emailActivation = await emailActivationDao.get(emailActivation2.uid)
            expect(emailActivation).not.toEqual(emailActivation1)
            expect(emailActivation).toEqual(emailActivation2)
            expect(emailActivation).not.toEqual(emailActivation3)

            emailActivation = await emailActivationDao.get(emailActivation3.uid)
            expect(emailActivation).not.toEqual(emailActivation1)
            expect(emailActivation).not.toEqual(emailActivation2)
            expect(emailActivation).toEqual(emailActivation3)


            //test list
            let emailActivations = await emailActivationDao.list()
            expect(emailActivations.length).toEqual(3)

            emailActivations = await emailActivationDao.list([{ field: 'createdDatetime' }])
            expect(emailActivations.length).toEqual(3)

            expect(emailActivations[0]).toEqual(emailActivation1)
            expect(emailActivations[1]).toEqual(emailActivation2)
            expect(emailActivations[2]).toEqual(emailActivation3)


            emailActivations = await emailActivationDao.list([{ field: 'createdDatetime', desc: true }])
            expect(emailActivations.length).toEqual(3)

            expect(emailActivations[0]).toEqual(emailActivation3)
            expect(emailActivations[1]).toEqual(emailActivation2)
            expect(emailActivations[2]).toEqual(emailActivation1)

            //test delete all
            await emailActivationDao.deleteAll()

            emailActivations = await emailActivationDao.list()
            expect(emailActivations.length).toEqual(0)

            count = await emailActivationDao.count()
            expect(count).toEqual(0)

            await userDao.delete(user.uid)
        })

        it('should update a emailActivation correctly', async () => {
            const userDao = new MysqlUserDao(connection!)
            const user = await userDao.create({
                email: 'atticcat@gmail.com',
                displayName: 'Dennis',
                hashedPassword: '123454'
            })

            const emailActivationDao = new MysqlEmailActivationDao(connection!)

            let count = await emailActivationDao.count()
            expect(count).toEqual(0)


            const emailActivation1 = await emailActivationDao.create({
                userUid: user.uid,
                token : 'abcdef1'
            })
            try {
                const emailActivation2 = await emailActivationDao.create({
                    userUid: user.uid,
                    token : 'abcdef1'
                })
                fail("should get error")
            } catch (err: any) {
                console.log(err.message)
            }


            const emailActivation2 = await emailActivationDao.create({
                userUid: user.uid,
                token : 'abcdef2'
            })

            let emailActivation = await emailActivationDao.get(emailActivation1.uid)
            expect(emailActivation).toEqual(emailActivation1)
            emailActivation = await emailActivationDao.get(emailActivation2.uid)
            expect(emailActivation).toEqual(emailActivation2)

            emailActivation = await emailActivationDao.update(emailActivation1.uid, {
            })
            expect(emailActivation).toEqual(emailActivation1)

            emailActivation = await emailActivationDao.update(emailActivation1.uid, {
                activatedDatetime: 1234
            })
            expect(emailActivation).not.toEqual(emailActivation1)
            expect(emailActivation.uid).toEqual(emailActivation1.uid)
            expect(emailActivation.userUid).toEqual(emailActivation1.userUid)
            expect(emailActivation.token).toEqual(emailActivation1.token)
            expect(emailActivation.createdDatetime).toEqual(emailActivation1.createdDatetime)
            expect(emailActivation.activatedDatetime).toEqual(1234)


            emailActivation = await emailActivationDao.update(emailActivation1.uid, {
                activatedDatetime: 5678
            })
            expect(emailActivation).not.toEqual(emailActivation1)
            expect(emailActivation.uid).toEqual(emailActivation1.uid)
            expect(emailActivation.userUid).toEqual(emailActivation1.userUid)
            expect(emailActivation.token).toEqual(emailActivation1.token)
            expect(emailActivation.createdDatetime).toEqual(emailActivation1.createdDatetime)
            expect(emailActivation.activatedDatetime).toEqual(5678)


            let emailActivationx = await emailActivationDao.get(emailActivation1.uid)
            expect(emailActivationx).toEqual(emailActivation)
            expect(emailActivationx).not.toEqual(emailActivation1)

            emailActivationx = await emailActivationDao.get(emailActivation2.uid)
            expect(emailActivationx).toEqual(emailActivation2)

            //clean up
            await emailActivationDao.deleteAll()
            count = await emailActivationDao.count()
            expect(count).toEqual(0)

            await userDao.delete(user.uid)
        })

        it('should query pagable correctly', async () => {

            const userDao = new MysqlUserDao(connection!)
            const user = await userDao.create({
                email: 'atticcat@gmail.com',
                displayName: 'Dennis',
                hashedPassword: '123454'
            })

            const emailActivationDao = new MysqlEmailActivationDao(connection!)
            let count = await emailActivationDao.count()
            expect(count).toEqual(0)

            for (let i = 0; i < 200; i++) {
                if (i % 2 === 0) {
                    const emailActivation = await emailActivationDao.create({
                        token: `abc${i}`,
                        userUid: user.uid
                    })
                } else {
                    const emailActivation = await emailActivationDao.create({
                        token: `xyz${i}`,
                        userUid: user.uid
                    })
                }
            }

            count = await emailActivationDao.count()
            expect(count).toEqual(200)


            let pageAll = await emailActivationDao.page()
            expect(pageAll.index).toEqual(0)
            expect(pageAll.totalPages).toEqual(1)
            expect(pageAll.totalItems).toEqual(200)
            expect(pageAll.pageSize).toEqual(200)
            expect(pageAll.content.length).toEqual(200)

            let emailActivation = pageAll.content[0]
            expect(emailActivation.token).toEqual('abc0')
            emailActivation = pageAll.content[1]
            expect(emailActivation.token).toEqual('xyz1')
            emailActivation = pageAll.content[198]
            expect(emailActivation.token).toEqual('abc198')
            emailActivation = pageAll.content[199]
            expect(emailActivation.token).toEqual('xyz199')


            pageAll = await emailActivationDao.page({ orderBy: { field: 'createdDatetime', desc: true } })
            expect(pageAll.index).toEqual(0)
            expect(pageAll.totalPages).toEqual(1)
            expect(pageAll.totalItems).toEqual(200)
            expect(pageAll.pageSize).toEqual(200)
            expect(pageAll.content.length).toEqual(200)


            emailActivation = pageAll.content[0]
            expect(emailActivation.token).toEqual('xyz199')
            emailActivation = pageAll.content[1]
            expect(emailActivation.token).toEqual('abc198')
            emailActivation = pageAll.content[198]
            expect(emailActivation.token).toEqual('xyz1')
            emailActivation = pageAll.content[199]
            expect(emailActivation.token).toEqual('abc0')


            //page 0, size 10, 0-9
            let page = await emailActivationDao.page({ pageSize: 10 })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            emailActivation = page.content[0]
            expect(emailActivation.token).toEqual('abc0')
            emailActivation = page.content[1]
            expect(emailActivation.token).toEqual('xyz1')
            emailActivation = page.content[8]
            expect(emailActivation.token).toEqual('abc8')
            emailActivation = page.content[9]
            expect(emailActivation.token).toEqual('xyz9')

            page = await emailActivationDao.page({ index: 0, pageSize: 10 })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            emailActivation = page.content[0]
            expect(emailActivation.token).toEqual('abc0')
            emailActivation = page.content[1]
            expect(emailActivation.token).toEqual('xyz1')
            emailActivation = page.content[8]
            expect(emailActivation.token).toEqual('abc8')
            emailActivation = page.content[9]
            expect(emailActivation.token).toEqual('xyz9')

            //page 3, size 10, 30-39
            page = await emailActivationDao.page({ index: 3, pageSize: 10 })
            expect(page.index).toEqual(3)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            emailActivation = page.content[0]
            expect(emailActivation.token).toEqual('abc30')
            emailActivation = page.content[1]
            expect(emailActivation.token).toEqual('xyz31')
            emailActivation = page.content[8]
            expect(emailActivation.token).toEqual('abc38')
            emailActivation = page.content[9]
            expect(emailActivation.token).toEqual('xyz39')


            //page 19, size 10, 190-199
            page = await emailActivationDao.page({ index: 19, pageSize: 10 })
            expect(page.index).toEqual(19)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            emailActivation = page.content[0]
            expect(emailActivation.token).toEqual('abc190')
            emailActivation = page.content[1]
            expect(emailActivation.token).toEqual('xyz191')
            emailActivation = page.content[8]
            expect(emailActivation.token).toEqual('abc198')
            emailActivation = page.content[9]
            expect(emailActivation.token).toEqual('xyz199')


            //page 20, size 10, 190-199
            page = await emailActivationDao.page({ index: 20, pageSize: 10 })
            expect(page.index).toEqual(20)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(0)


            //page 0, size 15, 0 - 14
            page = await emailActivationDao.page({ index: 0, pageSize: 15 })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(15)
            emailActivation = page.content[0]
            expect(emailActivation.token).toEqual('abc0')
            emailActivation = page.content[1]
            expect(emailActivation.token).toEqual('xyz1')
            emailActivation = page.content[13]
            expect(emailActivation.token).toEqual('xyz13')
            emailActivation = page.content[14]
            expect(emailActivation.token).toEqual('abc14')

            //page 13, size 15, 195-199
            page = await emailActivationDao.page({ index: 13, pageSize: 15 })
            expect(page.index).toEqual(13)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(5)
            emailActivation = page.content[0]
            expect(emailActivation.token).toEqual('xyz195')
            emailActivation = page.content[1]
            expect(emailActivation.token).toEqual('abc196')
            emailActivation = page.content[3]
            expect(emailActivation.token).toEqual('abc198')
            emailActivation = page.content[4]
            expect(emailActivation.token).toEqual('xyz199')



            //page 0, size 15, desc. 199 - 185
            page = await emailActivationDao.page({ index: 0, pageSize: 15, orderBy: { field: 'createdDatetime', desc: true } })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(15)
            emailActivation = page.content[0]
            expect(emailActivation.token).toEqual('xyz199')
            emailActivation = page.content[1]
            expect(emailActivation.token).toEqual('abc198')
            emailActivation = page.content[13]
            expect(emailActivation.token).toEqual('abc186')
            emailActivation = page.content[14]
            expect(emailActivation.token).toEqual('xyz185')

            //page 13, size 15, desc. 4 - 0
            page = await emailActivationDao.page({ index: 13, pageSize: 15, orderBy: { field: 'createdDatetime', desc: true } })
            expect(page.index).toEqual(13)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(5)
            emailActivation = page.content[0]
            expect(emailActivation.token).toEqual('abc4')
            emailActivation = page.content[1]
            expect(emailActivation.token).toEqual('xyz3')
            emailActivation = page.content[3]
            expect(emailActivation.token).toEqual('xyz1')
            emailActivation = page.content[4]
            expect(emailActivation.token).toEqual('abc0')

            //clean up
            await emailActivationDao.deleteAll()
            count = await emailActivationDao.count()
            expect(count).toEqual(0)

            await userDao.delete(user.uid)
        })
    })
}