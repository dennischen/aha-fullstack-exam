import { MysqlEmailVerificationDao } from '@/service/impl/MysqlEmailVerificationDao'
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
            let { results: result3 } = await mysqlQuery<any[]>(connection!, 'SELECT * FROM AHA_EMAIL_VERIFICATION')

            expect(result1.length).toBe(0)
            expect(result2.length).toBe(0)
            expect(result3.length).toBe(0)
        })
    })

    describe('Test EmailVerification Dao', () => {

        it('should create/delete a emailVerification correctly', async () => {

            const userDao = new MysqlUserDao(connection!)
            const user = await userDao.create({
                email: 'atticcat@gmail.com',
                displayName: 'Dennis',
                hashedPassword: '123454'
            })
            
            const emailVerificationDao = new MysqlEmailVerificationDao(connection!)

            let count = await emailVerificationDao.count()

            expect(count).toEqual(0)

            const emailVerification = await emailVerificationDao.create({
                userUid: user.uid,
                token : 'abcdef'
            })
            expect(emailVerification).toBeTruthy()

            let {
                uid,
                userUid,
                createdDatetime,
                verifiedDatetime,
                token
            } = emailVerification

            expect(uid).toBeTruthy()
            expect(userUid).toEqual(user.uid)
            expect(token).toEqual('abcdef')
            expect(createdDatetime).toBeTruthy()
            expect(verifiedDatetime).not.toBeTruthy()

            count = await emailVerificationDao.count()
            expect(count).toEqual(1)

            const emailVerification1 = await emailVerificationDao.get(emailVerification.uid)
            expect(emailVerification1).toBeTruthy()

            expect(emailVerification1.uid).toEqual(uid)
            expect(emailVerification1.userUid).toEqual(userUid)
            expect(emailVerification1.token).toEqual(token)
            expect(emailVerification1.createdDatetime).toEqual(createdDatetime)
            expect(emailVerification1.verifiedDatetime).toEqual(verifiedDatetime)

            expect(emailVerification1).toEqual(emailVerification)


            try {
                const emailVerification2 = await emailVerificationDao.create({
                    userUid: 'nosuchuser',
                    token : 'anewtoken'
                })
                fail("should get error")
            } catch (err: any) {
                console.log(err.message)
            }


            try {
                const emailVerification2 = await emailVerificationDao.get('nosuchid')
                fail("should get error")
            } catch (err: any) {
                console.log("catched error", err.message)
            }

            const emailVerification2 = await emailVerificationDao.findByToken('abcdef')

            expect(emailVerification2).toBeTruthy()

            expect(emailVerification2!.uid).toEqual(uid)
            expect(emailVerification2!.userUid).toEqual(userUid)
            expect(emailVerification2!.token).toEqual(token)
            expect(emailVerification2!.createdDatetime).toEqual(createdDatetime)
            expect(emailVerification2!.verifiedDatetime).toEqual(verifiedDatetime)

            expect(emailVerification2).toEqual(emailVerification)

            const emailVerification3 = await emailVerificationDao.findByToken('nosuchtoken')

            expect(emailVerification3).not.toBeTruthy()


            const deleted = await emailVerificationDao.delete(emailVerification.uid)
            expect(deleted).toBeTruthy()

            const deleted2 = await emailVerificationDao.delete('nosuchid')
            expect(deleted2).not.toBeTruthy()

            count = await emailVerificationDao.count()
            expect(count).toEqual(0)

            await userDao.delete(user.uid)
        })

        it('should create/delete multiple emailVerifications correctly', async () => {

            const userDao = new MysqlUserDao(connection!)
            const user = await userDao.create({
                email: 'atticcat@gmail.com',
                displayName: 'Dennis',
                hashedPassword: '123454'
            })

            const emailVerificationDao = new MysqlEmailVerificationDao(connection!)

            let count = await emailVerificationDao.count()
            expect(count).toEqual(0)

            //create 3 then delete all

            const emailVerification1 = await emailVerificationDao.create({
                userUid: user.uid,
                token : 'abcdef1'
            })
            const emailVerification2 = await emailVerificationDao.create({
                userUid: user.uid,
                token : 'abcdef2'
            })
            const emailVerification3 = await emailVerificationDao.create({
                userUid: user.uid,
                token : 'abcdef3'
            })

            count = await emailVerificationDao.count()
            expect(count).toEqual(3)


            let emailVerification = await emailVerificationDao.get(emailVerification1.uid)
            expect(emailVerification).toEqual(emailVerification1)
            expect(emailVerification).not.toEqual(emailVerification2)
            expect(emailVerification).not.toEqual(emailVerification3)

            emailVerification = await emailVerificationDao.get(emailVerification2.uid)
            expect(emailVerification).not.toEqual(emailVerification1)
            expect(emailVerification).toEqual(emailVerification2)
            expect(emailVerification).not.toEqual(emailVerification3)

            emailVerification = await emailVerificationDao.get(emailVerification3.uid)
            expect(emailVerification).not.toEqual(emailVerification1)
            expect(emailVerification).not.toEqual(emailVerification2)
            expect(emailVerification).toEqual(emailVerification3)


            //test list
            let emailVerifications = await emailVerificationDao.list()
            expect(emailVerifications.length).toEqual(3)

            emailVerifications = await emailVerificationDao.list([{ field: 'createdDatetime' }])
            expect(emailVerifications.length).toEqual(3)

            expect(emailVerifications[0]).toEqual(emailVerification1)
            expect(emailVerifications[1]).toEqual(emailVerification2)
            expect(emailVerifications[2]).toEqual(emailVerification3)


            emailVerifications = await emailVerificationDao.list([{ field: 'createdDatetime', desc: true }])
            expect(emailVerifications.length).toEqual(3)

            expect(emailVerifications[0]).toEqual(emailVerification3)
            expect(emailVerifications[1]).toEqual(emailVerification2)
            expect(emailVerifications[2]).toEqual(emailVerification1)

            //test delete all
            await emailVerificationDao.deleteAll()

            emailVerifications = await emailVerificationDao.list()
            expect(emailVerifications.length).toEqual(0)

            count = await emailVerificationDao.count()
            expect(count).toEqual(0)

            await userDao.delete(user.uid)
        })

        it('should update a emailVerification correctly', async () => {
            const userDao = new MysqlUserDao(connection!)
            const user = await userDao.create({
                email: 'atticcat@gmail.com',
                displayName: 'Dennis',
                hashedPassword: '123454'
            })

            const emailVerificationDao = new MysqlEmailVerificationDao(connection!)

            let count = await emailVerificationDao.count()
            expect(count).toEqual(0)


            const emailVerification1 = await emailVerificationDao.create({
                userUid: user.uid,
                token : 'abcdef1'
            })
            try {
                const emailVerification2 = await emailVerificationDao.create({
                    userUid: user.uid,
                    token : 'abcdef1'
                })
                fail("should get error")
            } catch (err: any) {
                console.log(err.message)
            }


            const emailVerification2 = await emailVerificationDao.create({
                userUid: user.uid,
                token : 'abcdef2'
            })

            let emailVerification = await emailVerificationDao.get(emailVerification1.uid)
            expect(emailVerification).toEqual(emailVerification1)
            emailVerification = await emailVerificationDao.get(emailVerification2.uid)
            expect(emailVerification).toEqual(emailVerification2)

            emailVerification = await emailVerificationDao.update(emailVerification1.uid, {
            })
            expect(emailVerification).toEqual(emailVerification1)

            emailVerification = await emailVerificationDao.update(emailVerification1.uid, {
                verifiedDatetime: 1234
            })
            expect(emailVerification).not.toEqual(emailVerification1)
            expect(emailVerification.uid).toEqual(emailVerification1.uid)
            expect(emailVerification.userUid).toEqual(emailVerification1.userUid)
            expect(emailVerification.token).toEqual(emailVerification1.token)
            expect(emailVerification.createdDatetime).toEqual(emailVerification1.createdDatetime)
            expect(emailVerification.verifiedDatetime).toEqual(1234)


            emailVerification = await emailVerificationDao.update(emailVerification1.uid, {
                verifiedDatetime: 5678
            })
            expect(emailVerification).not.toEqual(emailVerification1)
            expect(emailVerification.uid).toEqual(emailVerification1.uid)
            expect(emailVerification.userUid).toEqual(emailVerification1.userUid)
            expect(emailVerification.token).toEqual(emailVerification1.token)
            expect(emailVerification.createdDatetime).toEqual(emailVerification1.createdDatetime)
            expect(emailVerification.verifiedDatetime).toEqual(5678)


            let emailVerificationx = await emailVerificationDao.get(emailVerification1.uid)
            expect(emailVerificationx).toEqual(emailVerification)
            expect(emailVerificationx).not.toEqual(emailVerification1)

            emailVerificationx = await emailVerificationDao.get(emailVerification2.uid)
            expect(emailVerificationx).toEqual(emailVerification2)

            //clean up
            await emailVerificationDao.deleteAll()
            count = await emailVerificationDao.count()
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

            const emailVerificationDao = new MysqlEmailVerificationDao(connection!)
            let count = await emailVerificationDao.count()
            expect(count).toEqual(0)

            for (let i = 0; i < 200; i++) {
                if (i % 2 === 0) {
                    const emailVerification = await emailVerificationDao.create({
                        token: `abc${i}`,
                        userUid: user.uid
                    })
                } else {
                    const emailVerification = await emailVerificationDao.create({
                        token: `xyz${i}`,
                        userUid: user.uid
                    })
                }
            }

            count = await emailVerificationDao.count()
            expect(count).toEqual(200)


            let pageAll = await emailVerificationDao.page()
            expect(pageAll.index).toEqual(0)
            expect(pageAll.total).toEqual(1)
            expect(pageAll.totalItem).toEqual(200)
            expect(pageAll.size).toEqual(200)
            expect(pageAll.items.length).toEqual(200)

            let emailVerification = pageAll.items[0]
            expect(emailVerification.token).toEqual('abc0')
            emailVerification = pageAll.items[1]
            expect(emailVerification.token).toEqual('xyz1')
            emailVerification = pageAll.items[198]
            expect(emailVerification.token).toEqual('abc198')
            emailVerification = pageAll.items[199]
            expect(emailVerification.token).toEqual('xyz199')


            pageAll = await emailVerificationDao.page({ orderBy: { field: 'createdDatetime', desc: true } })
            expect(pageAll.index).toEqual(0)
            expect(pageAll.total).toEqual(1)
            expect(pageAll.totalItem).toEqual(200)
            expect(pageAll.size).toEqual(200)
            expect(pageAll.items.length).toEqual(200)


            emailVerification = pageAll.items[0]
            expect(emailVerification.token).toEqual('xyz199')
            emailVerification = pageAll.items[1]
            expect(emailVerification.token).toEqual('abc198')
            emailVerification = pageAll.items[198]
            expect(emailVerification.token).toEqual('xyz1')
            emailVerification = pageAll.items[199]
            expect(emailVerification.token).toEqual('abc0')


            //page 0, size 10, 0-9
            let page = await emailVerificationDao.page({ size: 10 })
            expect(page.index).toEqual(0)
            expect(page.total).toEqual(20)
            expect(page.totalItem).toEqual(200)
            expect(page.size).toEqual(10)
            expect(page.items.length).toEqual(10)
            emailVerification = page.items[0]
            expect(emailVerification.token).toEqual('abc0')
            emailVerification = page.items[1]
            expect(emailVerification.token).toEqual('xyz1')
            emailVerification = page.items[8]
            expect(emailVerification.token).toEqual('abc8')
            emailVerification = page.items[9]
            expect(emailVerification.token).toEqual('xyz9')

            page = await emailVerificationDao.page({ index: 0, size: 10 })
            expect(page.index).toEqual(0)
            expect(page.total).toEqual(20)
            expect(page.totalItem).toEqual(200)
            expect(page.size).toEqual(10)
            expect(page.items.length).toEqual(10)
            emailVerification = page.items[0]
            expect(emailVerification.token).toEqual('abc0')
            emailVerification = page.items[1]
            expect(emailVerification.token).toEqual('xyz1')
            emailVerification = page.items[8]
            expect(emailVerification.token).toEqual('abc8')
            emailVerification = page.items[9]
            expect(emailVerification.token).toEqual('xyz9')

            //page 3, size 10, 30-39
            page = await emailVerificationDao.page({ index: 3, size: 10 })
            expect(page.index).toEqual(3)
            expect(page.total).toEqual(20)
            expect(page.totalItem).toEqual(200)
            expect(page.size).toEqual(10)
            expect(page.items.length).toEqual(10)
            emailVerification = page.items[0]
            expect(emailVerification.token).toEqual('abc30')
            emailVerification = page.items[1]
            expect(emailVerification.token).toEqual('xyz31')
            emailVerification = page.items[8]
            expect(emailVerification.token).toEqual('abc38')
            emailVerification = page.items[9]
            expect(emailVerification.token).toEqual('xyz39')


            //page 19, size 10, 190-199
            page = await emailVerificationDao.page({ index: 19, size: 10 })
            expect(page.index).toEqual(19)
            expect(page.total).toEqual(20)
            expect(page.totalItem).toEqual(200)
            expect(page.size).toEqual(10)
            expect(page.items.length).toEqual(10)
            emailVerification = page.items[0]
            expect(emailVerification.token).toEqual('abc190')
            emailVerification = page.items[1]
            expect(emailVerification.token).toEqual('xyz191')
            emailVerification = page.items[8]
            expect(emailVerification.token).toEqual('abc198')
            emailVerification = page.items[9]
            expect(emailVerification.token).toEqual('xyz199')


            //page 20, size 10, 190-199
            page = await emailVerificationDao.page({ index: 20, size: 10 })
            expect(page.index).toEqual(20)
            expect(page.total).toEqual(20)
            expect(page.totalItem).toEqual(200)
            expect(page.size).toEqual(10)
            expect(page.items.length).toEqual(0)


            //page 0, size 15, 0 - 14
            page = await emailVerificationDao.page({ index: 0, size: 15 })
            expect(page.index).toEqual(0)
            expect(page.total).toEqual(14)
            expect(page.totalItem).toEqual(200)
            expect(page.size).toEqual(15)
            expect(page.items.length).toEqual(15)
            emailVerification = page.items[0]
            expect(emailVerification.token).toEqual('abc0')
            emailVerification = page.items[1]
            expect(emailVerification.token).toEqual('xyz1')
            emailVerification = page.items[13]
            expect(emailVerification.token).toEqual('xyz13')
            emailVerification = page.items[14]
            expect(emailVerification.token).toEqual('abc14')

            //page 13, size 15, 195-199
            page = await emailVerificationDao.page({ index: 13, size: 15 })
            expect(page.index).toEqual(13)
            expect(page.total).toEqual(14)
            expect(page.totalItem).toEqual(200)
            expect(page.size).toEqual(15)
            expect(page.items.length).toEqual(5)
            emailVerification = page.items[0]
            expect(emailVerification.token).toEqual('xyz195')
            emailVerification = page.items[1]
            expect(emailVerification.token).toEqual('abc196')
            emailVerification = page.items[3]
            expect(emailVerification.token).toEqual('abc198')
            emailVerification = page.items[4]
            expect(emailVerification.token).toEqual('xyz199')



            //page 0, size 15, desc. 199 - 185
            page = await emailVerificationDao.page({ index: 0, size: 15, orderBy: { field: 'createdDatetime', desc: true } })
            expect(page.index).toEqual(0)
            expect(page.total).toEqual(14)
            expect(page.totalItem).toEqual(200)
            expect(page.size).toEqual(15)
            expect(page.items.length).toEqual(15)
            emailVerification = page.items[0]
            expect(emailVerification.token).toEqual('xyz199')
            emailVerification = page.items[1]
            expect(emailVerification.token).toEqual('abc198')
            emailVerification = page.items[13]
            expect(emailVerification.token).toEqual('abc186')
            emailVerification = page.items[14]
            expect(emailVerification.token).toEqual('xyz185')

            //page 13, size 15, desc. 4 - 0
            page = await emailVerificationDao.page({ index: 13, size: 15, orderBy: { field: 'createdDatetime', desc: true } })
            expect(page.index).toEqual(13)
            expect(page.total).toEqual(14)
            expect(page.totalItem).toEqual(200)
            expect(page.size).toEqual(15)
            expect(page.items.length).toEqual(5)
            emailVerification = page.items[0]
            expect(emailVerification.token).toEqual('abc4')
            emailVerification = page.items[1]
            expect(emailVerification.token).toEqual('xyz3')
            emailVerification = page.items[3]
            expect(emailVerification.token).toEqual('xyz1')
            emailVerification = page.items[4]
            expect(emailVerification.token).toEqual('abc0')

            //clean up
            await emailVerificationDao.deleteAll()
            count = await emailVerificationDao.count()
            expect(count).toEqual(0)

            await userDao.delete(user.uid)
        })
    })
}