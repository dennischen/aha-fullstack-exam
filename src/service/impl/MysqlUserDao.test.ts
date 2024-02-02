/*
 * @author: Dennis Chen
 */

import { MysqlUserDao } from '@/service/impl/MysqlUserDao'
import { getConnection, query as mysqlQuery } from '@/service/impl/mysql-utils'
import fs from 'fs'
import path from 'path'
import mysql, { Pool, PoolConfig, PoolConnection } from 'mysql'

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
        it('should query 3 table correctly with empty data', async () => {

            let { results: result1 } = await mysqlQuery<any[]>(connection!, 'SELECT * FROM AHA_USER')
            let { results: result2 } = await mysqlQuery<any[]>(connection!, 'SELECT * FROM AHA_AUTH_SESSION')
            let { results: result3 } = await mysqlQuery<any[]>(connection!, 'SELECT * FROM AHA_ACTIVATION')

            expect(result1.length).toBe(0)
            expect(result2.length).toBe(0)
            expect(result3.length).toBe(0)
        })
    })

    describe('Test User Dao', () => {

        it('should create/delete a user correctly', async () => {

            const userDao = new MysqlUserDao(connection!)

            let count = await userDao.count()

            expect(count).toEqual(0)

            const user = await userDao.create({
                email: 'atticcat@gmail.com',
                displayName: 'Dennis Chen',
                hashedPassword: '12345678'
            })
            expect(user).toBeTruthy()

            let {
                uid,
                displayName,
                email,
                activated,
                hashedPassword,
                loginCount,
                lastAccessDatetime,
                createdDatetime,
                disabled, 
                signupDomain
            } = user

            expect(uid).toBeTruthy()
            expect(email).toEqual('atticcat@gmail.com')
            expect(displayName).toEqual('Dennis Chen')
            expect(hashedPassword).toEqual('12345678')
            expect(createdDatetime).toBeTruthy()
            expect(activated).toEqual(false)
            expect(loginCount).toEqual(0)
            expect(lastAccessDatetime).not.toBeTruthy()
            expect(disabled).toEqual(false)
            expect(signupDomain).not.toBeTruthy()

            count = await userDao.count()
            expect(count).toEqual(1)

            const user1 = await userDao.get(user.uid)
            expect(user1).toBeTruthy()

            expect(user1.uid).toEqual(uid)
            expect(user1.email).toEqual(email)
            expect(user1.displayName).toEqual(displayName)
            expect(user1.hashedPassword).toEqual(hashedPassword)
            expect(user1.createdDatetime).toEqual(createdDatetime)
            expect(user1.activated).toEqual(activated)
            expect(user1.loginCount).toEqual(loginCount)
            expect(user1.lastAccessDatetime).toEqual(lastAccessDatetime)
            expect(user1.disabled).toEqual(disabled)
            expect(user1.signupDomain).not.toBeTruthy()

            expect(user1).toEqual(user)

            try {
                const user2 = await userDao.get('nosuchid')
                fail("should get error")
            } catch (err: any) {
                
            }

            const user2 = await userDao.findByEmail('atticcat@gmail.com')

            expect(user2).toBeTruthy()

            expect(user2!.uid).toEqual(uid)
            expect(user2!.email).toEqual(email)
            expect(user2!.displayName).toEqual(displayName)
            expect(user2!.hashedPassword).toEqual(hashedPassword)
            expect(user2!.createdDatetime).toEqual(createdDatetime)
            expect(user2!.activated).toEqual(activated)
            expect(user2!.loginCount).toEqual(loginCount)
            expect(user2!.lastAccessDatetime).toEqual(lastAccessDatetime)
            expect(user2!.disabled).toEqual(disabled)
            expect(user2!.signupDomain).not.toBeTruthy()

            expect(user2).toEqual(user)


            const user3 = await userDao.findByEmail('atTicCAt@gmAil.com')

            expect(user3).toBeTruthy()

            expect(user3!.uid).toEqual(uid)
            expect(user3!.email).toEqual(email)
            expect(user3!.displayName).toEqual(displayName)
            expect(user3!.hashedPassword).toEqual(hashedPassword)
            expect(user3!.createdDatetime).toEqual(createdDatetime)
            expect(user3!.activated).toEqual(activated)
            expect(user3!.loginCount).toEqual(loginCount)
            expect(user3!.lastAccessDatetime).toEqual(lastAccessDatetime)
            expect(user3!.disabled).toEqual(disabled)
            expect(user3!.signupDomain).not.toBeTruthy()

            expect(user3).toEqual(user)

            const user4 = await userDao.findByEmail('nosuchidemail')

            expect(user4).not.toBeTruthy()


            const deleted = await userDao.delete(user.uid)
            expect(deleted).toBeTruthy()

            const deleted2 = await userDao.delete('nosuchid')
            expect(deleted2).not.toBeTruthy()

            count = await userDao.count()
            expect(count).toEqual(0)
        })

        it('should create a user with signup domain correctly', async () => {

            const userDao = new MysqlUserDao(connection!)

            let count = await userDao.count()

            expect(count).toEqual(0)

            const user = await userDao.create({
                email: 'atticcat@gmail.com',
                displayName: 'Dennis Chen',
                hashedPassword: '12345678',
                signupDomain: 'xyz'
            })
            expect(user).toBeTruthy()

            let {
                uid,
                displayName,
                email,
                activated,
                hashedPassword,
                loginCount,
                lastAccessDatetime,
                createdDatetime,
                disabled,
                signupDomain
            } = user

            expect(uid).toBeTruthy()
            expect(email).toEqual('atticcat@gmail.com')
            expect(displayName).toEqual('Dennis Chen')
            expect(hashedPassword).toEqual('12345678')
            expect(createdDatetime).toBeTruthy()
            expect(activated).toEqual(false)
            expect(loginCount).toEqual(0)
            expect(lastAccessDatetime).not.toBeTruthy()
            expect(disabled).toEqual(false)
            expect(signupDomain).toEqual('xyz')

            count = await userDao.count()
            expect(count).toEqual(1)

            const user1 = await userDao.get(user.uid)
            expect(user1).toBeTruthy()

            expect(user1.uid).toEqual(uid)
            expect(user1.email).toEqual(email)
            expect(user1.displayName).toEqual(displayName)
            expect(user1.hashedPassword).toEqual(hashedPassword)
            expect(user1.createdDatetime).toEqual(createdDatetime)
            expect(user1.activated).toEqual(activated)
            expect(user1.loginCount).toEqual(loginCount)
            expect(user1.lastAccessDatetime).toEqual(lastAccessDatetime)
            expect(user1.disabled).toEqual(disabled)
            expect(user1.signupDomain).toEqual('xyz')

            expect(user1).toEqual(user)

            const user2 = await userDao.findByEmail('atticcat@gmail.com')

            expect(user2).toBeTruthy()

            expect(user2!.uid).toEqual(uid)
            expect(user2!.email).toEqual(email)
            expect(user2!.displayName).toEqual(displayName)
            expect(user2!.hashedPassword).toEqual(hashedPassword)
            expect(user2!.createdDatetime).toEqual(createdDatetime)
            expect(user2!.activated).toEqual(activated)
            expect(user2!.loginCount).toEqual(loginCount)
            expect(user2!.lastAccessDatetime).toEqual(lastAccessDatetime)
            expect(user2!.disabled).toEqual(disabled)
            expect(user2!.signupDomain).toEqual('xyz')

            expect(user2).toEqual(user)


            await userDao.delete(user.uid)

            count = await userDao.count()
            expect(count).toEqual(0)
        })

        it('should create/delete multiple users correctly', async () => {

            const userDao = new MysqlUserDao(connection!)

            let count = await userDao.count()
            expect(count).toEqual(0)

            //create 3 then delete all

            const user1 = await userDao.create({
                email: 'atticcat1@gmail.com',
                displayName: 'Dennis Chen1',
                hashedPassword: '12345678'
            })
            const user2 = await userDao.create({
                email: 'atticcat2@gmail.com',
                displayName: 'Dennis Chen2',
                hashedPassword: '12345678'
            })
            const user3 = await userDao.create({
                email: 'atticcat3@gmail.com',
                displayName: 'Dennis Chen3',
                hashedPassword: '12345678'
            })

            count = await userDao.count()
            expect(count).toEqual(3)


            let user = await userDao.get(user1.uid)
            expect(user).toEqual(user1)
            expect(user).not.toEqual(user2)
            expect(user).not.toEqual(user3)

            user = await userDao.get(user2.uid)
            expect(user).not.toEqual(user1)
            expect(user).toEqual(user2)
            expect(user).not.toEqual(user3)

            user = await userDao.get(user3.uid)
            expect(user).not.toEqual(user1)
            expect(user).not.toEqual(user2)
            expect(user).toEqual(user3)


            //test list
            let users = await userDao.list()
            expect(users.length).toEqual(3)

            users = await userDao.list([{ field: 'createdDatetime' }])
            expect(users.length).toEqual(3)

            expect(users[0]).toEqual(user1)
            expect(users[1]).toEqual(user2)
            expect(users[2]).toEqual(user3)


            users = await userDao.list([{ field: 'createdDatetime', desc: true }])
            expect(users.length).toEqual(3)

            expect(users[0]).toEqual(user3)
            expect(users[1]).toEqual(user2)
            expect(users[2]).toEqual(user1)

            //test delete all
            await userDao.deleteAll()

            users = await userDao.list()
            expect(users.length).toEqual(0)

            count = await userDao.count()
            expect(count).toEqual(0)

        })

        it('should update a user correctly', async () => {

            const userDao = new MysqlUserDao(connection!)

            let count = await userDao.count()
            expect(count).toEqual(0)


            const user1 = await userDao.create({
                email: 'atticcat1@gmail.com',
                displayName: 'Dennis Chen 1',
                hashedPassword: '12345678'
            })
            try {
                const user2 = await userDao.create({
                    email: 'atticcat1@gmail.com',
                    displayName: 'Dennis Chen 1',
                    hashedPassword: '12345678'
                })
                fail("should get error")
            } catch (err: any) {
                
            }


            const user2 = await userDao.create({
                email: 'atticcat2@gmail.com',
                displayName: 'Dennis Chen 2',
                hashedPassword: '87654321',
                signupDomain: 'xyz'
            })

            let user = await userDao.get(user1.uid)
            expect(user).toEqual(user1)
            user = await userDao.get(user2.uid)
            expect(user).toEqual(user2)

            user = await userDao.update(user1.uid, {
            })
            expect(user).toEqual(user1)

            user = await userDao.update(user1.uid, {
                displayName: 'Mr. D'
            })
            expect(user).not.toEqual(user1)
            expect(user.uid).toEqual(user1.uid)
            expect(user.email).toEqual(user1.email)
            expect(user.displayName).toEqual('Mr. D')
            expect(user.hashedPassword).toEqual(user1.hashedPassword)
            expect(user.createdDatetime).toEqual(user1.createdDatetime)
            expect(user.activated).toEqual(user1.activated)
            expect(user.loginCount).toEqual(user1.loginCount)
            expect(user.lastAccessDatetime).toEqual(user1.lastAccessDatetime)
            expect(user.disabled).toEqual(user1.disabled)
            expect(user.signupDomain).toEqual(user1.signupDomain)


            user = await userDao.update(user1.uid, {
                loginCount: 20,
                disabled: true,
                activated: true,
                displayName: 'Dr. D',
                hashedPassword: '5678',
                lastAccessDatetime: 7788
            })
            expect(user.uid).toEqual(user1.uid)
            expect(user.email).toEqual(user1.email)
            expect(user.displayName).toEqual('Dr. D')
            expect(user.hashedPassword).toEqual('5678')
            expect(user.createdDatetime).toEqual(user1.createdDatetime)
            expect(user.activated).toEqual(true)
            expect(user.loginCount).toEqual(20)
            expect(user.lastAccessDatetime).toEqual(7788)
            expect(user.disabled).toEqual(true)
            expect(user.signupDomain).toEqual(user1.signupDomain)


            let userx = await userDao.get(user1.uid)
            expect(userx).toEqual(user)
            expect(userx).not.toEqual(user1)

            userx = await userDao.get(user2.uid)
            expect(userx).toEqual(user2)

            //clean up
            await userDao.deleteAll()
            count = await userDao.count()
            expect(count).toEqual(0)

        })

        it('should query pagable correctly', async () => {
            const userDao = new MysqlUserDao(connection!)
            let count = await userDao.count()
            expect(count).toEqual(0)

            for (let i = 0; i < 200; i++) {
                if (i % 2 === 0) {
                    const user = await userDao.create({
                        email: `atticcat${i}@gmail.com`,
                        displayName: `Dennis Chen${i}`,
                        hashedPassword: '12345678'
                    })
                } else {
                    const user = await userDao.create({
                        email: `cola.orange${i}@gmail.com`,
                        displayName: `ColaOrange${i}`,
                        hashedPassword: '12345678'
                    })
                }
            }

            count = await userDao.count()
            expect(count).toEqual(200)


            let pageAll = await userDao.page()
            expect(pageAll.index).toEqual(0)
            expect(pageAll.totalPages).toEqual(1)
            expect(pageAll.totalItems).toEqual(200)
            expect(pageAll.pageSize).toEqual(200)
            expect(pageAll.content.length).toEqual(200)

            let user = pageAll.content[0]
            expect(user.displayName).toEqual('Dennis Chen0')
            user = pageAll.content[1]
            expect(user.displayName).toEqual('ColaOrange1')
            user = pageAll.content[198]
            expect(user.displayName).toEqual('Dennis Chen198')
            user = pageAll.content[199]
            expect(user.displayName).toEqual('ColaOrange199')


            pageAll = await userDao.page({ orderBy: { field: 'createdDatetime', desc: true } })
            expect(pageAll.index).toEqual(0)
            expect(pageAll.totalPages).toEqual(1)
            expect(pageAll.totalItems).toEqual(200)
            expect(pageAll.pageSize).toEqual(200)
            expect(pageAll.content.length).toEqual(200)


            user = pageAll.content[0]
            expect(user.displayName).toEqual('ColaOrange199')
            user = pageAll.content[1]
            expect(user.displayName).toEqual('Dennis Chen198')
            user = pageAll.content[198]
            expect(user.displayName).toEqual('ColaOrange1')
            user = pageAll.content[199]
            expect(user.displayName).toEqual('Dennis Chen0')


            //page 0, size 10, 0-9
            let page = await userDao.page({ pageSize: 10 })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            user = page.content[0]
            expect(user.displayName).toEqual('Dennis Chen0')
            user = page.content[1]
            expect(user.displayName).toEqual('ColaOrange1')
            user = page.content[8]
            expect(user.displayName).toEqual('Dennis Chen8')
            user = page.content[9]
            expect(user.displayName).toEqual('ColaOrange9')

            page = await userDao.page({ index: 0, pageSize: 10 })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            user = page.content[0]
            expect(user.displayName).toEqual('Dennis Chen0')
            user = page.content[1]
            expect(user.displayName).toEqual('ColaOrange1')
            user = page.content[8]
            expect(user.displayName).toEqual('Dennis Chen8')
            user = page.content[9]
            expect(user.displayName).toEqual('ColaOrange9')

            //page 3, size 10, 30-39
            page = await userDao.page({ index: 3, pageSize: 10 })
            expect(page.index).toEqual(3)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            user = page.content[0]
            expect(user.displayName).toEqual('Dennis Chen30')
            user = page.content[1]
            expect(user.displayName).toEqual('ColaOrange31')
            user = page.content[8]
            expect(user.displayName).toEqual('Dennis Chen38')
            user = page.content[9]
            expect(user.displayName).toEqual('ColaOrange39')


            //page 19, size 10, 190-199
            page = await userDao.page({ index: 19, pageSize: 10 })
            expect(page.index).toEqual(19)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            user = page.content[0]
            expect(user.displayName).toEqual('Dennis Chen190')
            user = page.content[1]
            expect(user.displayName).toEqual('ColaOrange191')
            user = page.content[8]
            expect(user.displayName).toEqual('Dennis Chen198')
            user = page.content[9]
            expect(user.displayName).toEqual('ColaOrange199')


            //page 20, size 10, 190-199
            page = await userDao.page({ index: 20, pageSize: 10 })
            expect(page.index).toEqual(20)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(0)


            //page 0, size 15, 0 - 14
            page = await userDao.page({ index: 0, pageSize: 15 })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(15)
            user = page.content[0]
            expect(user.displayName).toEqual('Dennis Chen0')
            user = page.content[1]
            expect(user.displayName).toEqual('ColaOrange1')
            user = page.content[13]
            expect(user.displayName).toEqual('ColaOrange13')
            user = page.content[14]
            expect(user.displayName).toEqual('Dennis Chen14')

            //page 13, size 15, 195-199
            page = await userDao.page({ index: 13, pageSize: 15 })
            expect(page.index).toEqual(13)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(5)
            user = page.content[0]
            expect(user.displayName).toEqual('ColaOrange195')
            user = page.content[1]
            expect(user.displayName).toEqual('Dennis Chen196')
            user = page.content[3]
            expect(user.displayName).toEqual('Dennis Chen198')
            user = page.content[4]
            expect(user.displayName).toEqual('ColaOrange199')



            //page 0, size 15, desc. 199 - 185
            page = await userDao.page({ index: 0, pageSize: 15, orderBy: { field: 'createdDatetime', desc : true} })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(15)
            user = page.content[0]
            expect(user.displayName).toEqual('ColaOrange199')
            user = page.content[1]
            expect(user.displayName).toEqual('Dennis Chen198')
            user = page.content[13]
            expect(user.displayName).toEqual('Dennis Chen186')
            user = page.content[14]
            expect(user.displayName).toEqual('ColaOrange185')

            //page 13, size 15, desc. 4 - 0
            page = await userDao.page({ index: 13, pageSize: 15 , orderBy: { field: 'createdDatetime', desc : true} })
            expect(page.index).toEqual(13)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(5)
            user = page.content[0]
            expect(user.displayName).toEqual('Dennis Chen4')
            user = page.content[1]
            expect(user.displayName).toEqual('ColaOrange3')
            user = page.content[3]
            expect(user.displayName).toEqual('ColaOrange1')
            user = page.content[4]
            expect(user.displayName).toEqual('Dennis Chen0')

            //clean up
            await userDao.deleteAll()
            count = await userDao.count()
            expect(count).toEqual(0)
        })
    })
}