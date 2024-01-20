import { MysqlAuthSessionDao } from '@/service/impl/MysqlAuthSessionDao'
import { getConnection, query as mysqlQuery } from '@/service/impl/utils'
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
            let { results: result3 } = await mysqlQuery<any[]>(connection!, 'SELECT * FROM AHA_ACTIVATION')

            expect(result1.length).toBe(0)
            expect(result2.length).toBe(0)
            expect(result3.length).toBe(0)
        })
    })

    describe('Test AuthSession Dao', () => {

        it('should create/delete a authSession correctly', async () => {

            const userDao = new MysqlUserDao(connection!)
            const user = await userDao.create({
                email: 'atticcat@gmail.com',
                displayName: 'Dennis',
                hashedPassword: '123454'
            })
            
            const authSessionDao = new MysqlAuthSessionDao(connection!)

            let count = await authSessionDao.count()

            expect(count).toEqual(0)

            const authSession = await authSessionDao.create({
                userUid: user.uid,
                token : 'abcdef'
            })
            expect(authSession).toBeTruthy()

            let {
                uid,
                userUid,
                lastAccessDatetime,
                createdDatetime,
                invalid,
                token
            } = authSession

            expect(uid).toBeTruthy()
            expect(userUid).toEqual(user.uid)
            expect(token).toEqual('abcdef')
            expect(createdDatetime).toBeTruthy()
            expect(invalid).toEqual(false)
            expect(lastAccessDatetime).toBeTruthy()

            count = await authSessionDao.count()
            expect(count).toEqual(1)

            const authSession1 = await authSessionDao.get(authSession.uid)
            expect(authSession1).toBeTruthy()

            expect(authSession1.uid).toEqual(uid)
            expect(authSession1.userUid).toEqual(userUid)
            expect(authSession1.token).toEqual(token)
            expect(authSession1.createdDatetime).toEqual(createdDatetime)
            expect(authSession1.invalid).toEqual(invalid)
            expect(authSession1.lastAccessDatetime).toEqual(lastAccessDatetime)

            expect(authSession1).toEqual(authSession)


            try {
                const authSession2 = await authSessionDao.create({
                    userUid: 'nosuchuser',
                    token : 'anewtoken'
                })
                fail("should get error")
            } catch (err: any) {
                
            }


            try {
                const authSession2 = await authSessionDao.get('nosuchid')
                fail("should get error")
            } catch (err: any) {
                
            }

            const authSession2 = await authSessionDao.findByToken('abcdef')

            expect(authSession2).toBeTruthy()

            expect(authSession2!.uid).toEqual(uid)
            expect(authSession2!.userUid).toEqual(userUid)
            expect(authSession2!.token).toEqual(token)
            expect(authSession2!.createdDatetime).toEqual(createdDatetime)
            expect(authSession2!.invalid).toEqual(invalid)
            expect(authSession2!.lastAccessDatetime).toEqual(lastAccessDatetime)

            expect(authSession2).toEqual(authSession)

            const authSession3 = await authSessionDao.findByToken('nosuchtoken')

            expect(authSession3).not.toBeTruthy()


            const deleted = await authSessionDao.delete(authSession.uid)
            expect(deleted).toBeTruthy()

            const deleted2 = await authSessionDao.delete('nosuchid')
            expect(deleted2).not.toBeTruthy()

            count = await authSessionDao.count()
            expect(count).toEqual(0)

            await userDao.delete(user.uid)
        })

        it('should create/delete multiple authSessions correctly', async () => {

            const userDao = new MysqlUserDao(connection!)
            const user = await userDao.create({
                email: 'atticcat@gmail.com',
                displayName: 'Dennis',
                hashedPassword: '123454'
            })

            const authSessionDao = new MysqlAuthSessionDao(connection!)

            let count = await authSessionDao.count()
            expect(count).toEqual(0)

            //create 3 then delete all

            const authSession1 = await authSessionDao.create({
                userUid: user.uid,
                token : 'abcdef1'
            })
            const authSession2 = await authSessionDao.create({
                userUid: user.uid,
                token : 'abcdef2'
            })
            const authSession3 = await authSessionDao.create({
                userUid: user.uid,
                token : 'abcdef3'
            })

            count = await authSessionDao.count()
            expect(count).toEqual(3)


            let authSession = await authSessionDao.get(authSession1.uid)
            expect(authSession).toEqual(authSession1)
            expect(authSession).not.toEqual(authSession2)
            expect(authSession).not.toEqual(authSession3)

            authSession = await authSessionDao.get(authSession2.uid)
            expect(authSession).not.toEqual(authSession1)
            expect(authSession).toEqual(authSession2)
            expect(authSession).not.toEqual(authSession3)

            authSession = await authSessionDao.get(authSession3.uid)
            expect(authSession).not.toEqual(authSession1)
            expect(authSession).not.toEqual(authSession2)
            expect(authSession).toEqual(authSession3)


            //test list
            let authSessions = await authSessionDao.list()
            expect(authSessions.length).toEqual(3)

            authSessions = await authSessionDao.list([{ field: 'createdDatetime' }])
            expect(authSessions.length).toEqual(3)

            expect(authSessions[0]).toEqual(authSession1)
            expect(authSessions[1]).toEqual(authSession2)
            expect(authSessions[2]).toEqual(authSession3)


            authSessions = await authSessionDao.list([{ field: 'createdDatetime', desc: true }])
            expect(authSessions.length).toEqual(3)

            expect(authSessions[0]).toEqual(authSession3)
            expect(authSessions[1]).toEqual(authSession2)
            expect(authSessions[2]).toEqual(authSession1)

            //test delete all
            await authSessionDao.deleteAll()

            authSessions = await authSessionDao.list()
            expect(authSessions.length).toEqual(0)

            count = await authSessionDao.count()
            expect(count).toEqual(0)

            await userDao.delete(user.uid)
        })

        it('should update a authSession correctly', async () => {
            const userDao = new MysqlUserDao(connection!)
            const user = await userDao.create({
                email: 'atticcat@gmail.com',
                displayName: 'Dennis',
                hashedPassword: '123454'
            })

            const authSessionDao = new MysqlAuthSessionDao(connection!)

            let count = await authSessionDao.count()
            expect(count).toEqual(0)


            const authSession1 = await authSessionDao.create({
                userUid: user.uid,
                token : 'abcdef1'
            })
            try {
                const authSession2 = await authSessionDao.create({
                    userUid: user.uid,
                    token : 'abcdef1'
                })
                fail("should get error")
            } catch (err: any) {
                
            }


            const authSession2 = await authSessionDao.create({
                userUid: user.uid,
                token : 'abcdef2'
            })

            let authSession = await authSessionDao.get(authSession1.uid)
            expect(authSession).toEqual(authSession1)
            authSession = await authSessionDao.get(authSession2.uid)
            expect(authSession).toEqual(authSession2)

            authSession = await authSessionDao.update(authSession1.uid, {
            })
            expect(authSession).toEqual(authSession1)

            authSession = await authSessionDao.update(authSession1.uid, {
               lastAccessDatetime: 1234
            })
            expect(authSession).not.toEqual(authSession1)
            expect(authSession.uid).toEqual(authSession1.uid)
            expect(authSession.userUid).toEqual(authSession1.userUid)
            expect(authSession.token).toEqual(authSession1.token)
            expect(authSession.createdDatetime).toEqual(authSession1.createdDatetime)
            expect(authSession.invalid).toEqual(authSession1.invalid)
            expect(authSession.lastAccessDatetime).toEqual(1234)


            authSession = await authSessionDao.update(authSession1.uid, {
                lastAccessDatetime: 5678,
                invalid: true
            })
            expect(authSession).not.toEqual(authSession1)
            expect(authSession.uid).toEqual(authSession1.uid)
            expect(authSession.userUid).toEqual(authSession1.userUid)
            expect(authSession.token).toEqual(authSession1.token)
            expect(authSession.createdDatetime).toEqual(authSession1.createdDatetime)
            expect(authSession.invalid).toEqual(true)
            expect(authSession.lastAccessDatetime).toEqual(5678)


            let authSessionx = await authSessionDao.get(authSession1.uid)
            expect(authSessionx).toEqual(authSession)
            expect(authSessionx).not.toEqual(authSession1)

            authSessionx = await authSessionDao.get(authSession2.uid)
            expect(authSessionx).toEqual(authSession2)

            //clean up
            await authSessionDao.deleteAll()
            count = await authSessionDao.count()
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

            const authSessionDao = new MysqlAuthSessionDao(connection!)
            let count = await authSessionDao.count()
            expect(count).toEqual(0)

            for (let i = 0; i < 200; i++) {
                if (i % 2 === 0) {
                    const authSession = await authSessionDao.create({
                        token: `abc${i}`,
                        userUid: user.uid
                    })
                } else {
                    const authSession = await authSessionDao.create({
                        token: `xyz${i}`,
                        userUid: user.uid
                    })
                }
            }

            count = await authSessionDao.count()
            expect(count).toEqual(200)


            let pageAll = await authSessionDao.page()
            expect(pageAll.index).toEqual(0)
            expect(pageAll.totalPages).toEqual(1)
            expect(pageAll.totalItems).toEqual(200)
            expect(pageAll.pageSize).toEqual(200)
            expect(pageAll.content.length).toEqual(200)

            let authSession = pageAll.content[0]
            expect(authSession.token).toEqual('abc0')
            authSession = pageAll.content[1]
            expect(authSession.token).toEqual('xyz1')
            authSession = pageAll.content[198]
            expect(authSession.token).toEqual('abc198')
            authSession = pageAll.content[199]
            expect(authSession.token).toEqual('xyz199')


            pageAll = await authSessionDao.page({ orderBy: { field: 'createdDatetime', desc: true } })
            expect(pageAll.index).toEqual(0)
            expect(pageAll.totalPages).toEqual(1)
            expect(pageAll.totalItems).toEqual(200)
            expect(pageAll.pageSize).toEqual(200)
            expect(pageAll.content.length).toEqual(200)


            authSession = pageAll.content[0]
            expect(authSession.token).toEqual('xyz199')
            authSession = pageAll.content[1]
            expect(authSession.token).toEqual('abc198')
            authSession = pageAll.content[198]
            expect(authSession.token).toEqual('xyz1')
            authSession = pageAll.content[199]
            expect(authSession.token).toEqual('abc0')


            //page 0, size 10, 0-9
            let page = await authSessionDao.page({ pageSize: 10 })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            authSession = page.content[0]
            expect(authSession.token).toEqual('abc0')
            authSession = page.content[1]
            expect(authSession.token).toEqual('xyz1')
            authSession = page.content[8]
            expect(authSession.token).toEqual('abc8')
            authSession = page.content[9]
            expect(authSession.token).toEqual('xyz9')

            page = await authSessionDao.page({ index: 0, pageSize: 10 })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            authSession = page.content[0]
            expect(authSession.token).toEqual('abc0')
            authSession = page.content[1]
            expect(authSession.token).toEqual('xyz1')
            authSession = page.content[8]
            expect(authSession.token).toEqual('abc8')
            authSession = page.content[9]
            expect(authSession.token).toEqual('xyz9')

            //page 3, size 10, 30-39
            page = await authSessionDao.page({ index: 3, pageSize: 10 })
            expect(page.index).toEqual(3)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            authSession = page.content[0]
            expect(authSession.token).toEqual('abc30')
            authSession = page.content[1]
            expect(authSession.token).toEqual('xyz31')
            authSession = page.content[8]
            expect(authSession.token).toEqual('abc38')
            authSession = page.content[9]
            expect(authSession.token).toEqual('xyz39')


            //page 19, size 10, 190-199
            page = await authSessionDao.page({ index: 19, pageSize: 10 })
            expect(page.index).toEqual(19)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            authSession = page.content[0]
            expect(authSession.token).toEqual('abc190')
            authSession = page.content[1]
            expect(authSession.token).toEqual('xyz191')
            authSession = page.content[8]
            expect(authSession.token).toEqual('abc198')
            authSession = page.content[9]
            expect(authSession.token).toEqual('xyz199')


            //page 20, size 10, 190-199
            page = await authSessionDao.page({ index: 20, pageSize: 10 })
            expect(page.index).toEqual(20)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(0)


            //page 0, size 15, 0 - 14
            page = await authSessionDao.page({ index: 0, pageSize: 15 })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(15)
            authSession = page.content[0]
            expect(authSession.token).toEqual('abc0')
            authSession = page.content[1]
            expect(authSession.token).toEqual('xyz1')
            authSession = page.content[13]
            expect(authSession.token).toEqual('xyz13')
            authSession = page.content[14]
            expect(authSession.token).toEqual('abc14')

            //page 13, size 15, 195-199
            page = await authSessionDao.page({ index: 13, pageSize: 15 })
            expect(page.index).toEqual(13)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(5)
            authSession = page.content[0]
            expect(authSession.token).toEqual('xyz195')
            authSession = page.content[1]
            expect(authSession.token).toEqual('abc196')
            authSession = page.content[3]
            expect(authSession.token).toEqual('abc198')
            authSession = page.content[4]
            expect(authSession.token).toEqual('xyz199')



            //page 0, size 15, desc. 199 - 185
            page = await authSessionDao.page({ index: 0, pageSize: 15, orderBy: { field: 'createdDatetime', desc: true } })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(15)
            authSession = page.content[0]
            expect(authSession.token).toEqual('xyz199')
            authSession = page.content[1]
            expect(authSession.token).toEqual('abc198')
            authSession = page.content[13]
            expect(authSession.token).toEqual('abc186')
            authSession = page.content[14]
            expect(authSession.token).toEqual('xyz185')

            //page 13, size 15, desc. 4 - 0
            page = await authSessionDao.page({ index: 13, pageSize: 15, orderBy: { field: 'createdDatetime', desc: true } })
            expect(page.index).toEqual(13)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(5)
            authSession = page.content[0]
            expect(authSession.token).toEqual('abc4')
            authSession = page.content[1]
            expect(authSession.token).toEqual('xyz3')
            authSession = page.content[3]
            expect(authSession.token).toEqual('xyz1')
            authSession = page.content[4]
            expect(authSession.token).toEqual('abc0')

            //clean up
            await authSessionDao.deleteAll()
            count = await authSessionDao.count()
            expect(count).toEqual(0)

            await userDao.delete(user.uid)
        })
    })
}