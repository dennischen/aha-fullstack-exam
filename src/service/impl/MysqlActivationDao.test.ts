/*
 * @author: Dennis Chen
 */

import { MysqlActivationDao } from '@/service/impl/MysqlActivationDao'
import { getConnection, query as mysqlQuery } from '@/service/impl/mysql-utils'
import fs from 'fs'
import path from 'path'
import mysql, { Pool, PoolConfig, PoolConnection } from 'mysql'
import { MysqlUserDao } from './MysqlUserDao'

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

    describe('Test Activation Dao', () => {

        it('should create/delete a activation correctly', async () => {

            const userDao = new MysqlUserDao(connection!)
            const user = await userDao.create({
                email: 'atticcat@gmail.com',
                displayName: 'Dennis',
                hashedPassword: '123454'
            })
            
            const activationDao = new MysqlActivationDao(connection!)

            let count = await activationDao.count()

            expect(count).toEqual(0)

            const activation = await activationDao.create({
                userUid: user.uid,
                token : 'abcdef'
            })
            expect(activation).toBeTruthy()

            let {
                uid,
                userUid,
                createdDatetime,
                activatedDatetime,
                token
            } = activation

            expect(uid).toBeTruthy()
            expect(userUid).toEqual(user.uid)
            expect(token).toEqual('abcdef')
            expect(createdDatetime).toBeTruthy()
            expect(activatedDatetime).not.toBeTruthy()

            count = await activationDao.count()
            expect(count).toEqual(1)

            const activation1 = await activationDao.get(activation.uid)
            expect(activation1).toBeTruthy()

            expect(activation1.uid).toEqual(uid)
            expect(activation1.userUid).toEqual(userUid)
            expect(activation1.token).toEqual(token)
            expect(activation1.createdDatetime).toEqual(createdDatetime)
            expect(activation1.activatedDatetime).toEqual(activatedDatetime)

            expect(activation1).toEqual(activation)


            try {
                const activation2 = await activationDao.create({
                    userUid: 'nosuchuser',
                    token : 'anewtoken'
                })
                fail("should get error")
            } catch (err: any) {
                
            }


            try {
                const activation2 = await activationDao.get('nosuchid')
                fail("should get error")
            } catch (err: any) {
                
            }

            const activation2 = await activationDao.findByToken('abcdef')

            expect(activation2).toBeTruthy()

            expect(activation2!.uid).toEqual(uid)
            expect(activation2!.userUid).toEqual(userUid)
            expect(activation2!.token).toEqual(token)
            expect(activation2!.createdDatetime).toEqual(createdDatetime)
            expect(activation2!.activatedDatetime).toEqual(activatedDatetime)

            expect(activation2).toEqual(activation)

            const activation3 = await activationDao.findByToken('nosuchtoken')

            expect(activation3).not.toBeTruthy()


            const deleted = await activationDao.delete(activation.uid)
            expect(deleted).toBeTruthy()

            const deleted2 = await activationDao.delete('nosuchid')
            expect(deleted2).not.toBeTruthy()

            count = await activationDao.count()
            expect(count).toEqual(0)

            await userDao.delete(user.uid)
        })

        it('should create/delete multiple activations correctly', async () => {

            const userDao = new MysqlUserDao(connection!)
            const user = await userDao.create({
                email: 'atticcat@gmail.com',
                displayName: 'Dennis',
                hashedPassword: '123454'
            })

            const activationDao = new MysqlActivationDao(connection!)

            let count = await activationDao.count()
            expect(count).toEqual(0)

            //create 3 then delete all

            const activation1 = await activationDao.create({
                userUid: user.uid,
                token : 'abcdef1'
            })
            const activation2 = await activationDao.create({
                userUid: user.uid,
                token : 'abcdef2'
            })
            const activation3 = await activationDao.create({
                userUid: user.uid,
                token : 'abcdef3'
            })

            count = await activationDao.count()
            expect(count).toEqual(3)


            let activation = await activationDao.get(activation1.uid)
            expect(activation).toEqual(activation1)
            expect(activation).not.toEqual(activation2)
            expect(activation).not.toEqual(activation3)

            activation = await activationDao.get(activation2.uid)
            expect(activation).not.toEqual(activation1)
            expect(activation).toEqual(activation2)
            expect(activation).not.toEqual(activation3)

            activation = await activationDao.get(activation3.uid)
            expect(activation).not.toEqual(activation1)
            expect(activation).not.toEqual(activation2)
            expect(activation).toEqual(activation3)


            //test list
            let activations = await activationDao.list()
            expect(activations.length).toEqual(3)

            activations = await activationDao.list([{ field: 'createdDatetime' }])
            expect(activations.length).toEqual(3)

            expect(activations[0]).toEqual(activation1)
            expect(activations[1]).toEqual(activation2)
            expect(activations[2]).toEqual(activation3)


            activations = await activationDao.list([{ field: 'createdDatetime', desc: true }])
            expect(activations.length).toEqual(3)

            expect(activations[0]).toEqual(activation3)
            expect(activations[1]).toEqual(activation2)
            expect(activations[2]).toEqual(activation1)

            //test delete all
            await activationDao.deleteAll()

            activations = await activationDao.list()
            expect(activations.length).toEqual(0)

            count = await activationDao.count()
            expect(count).toEqual(0)

            await userDao.delete(user.uid)
        })

        it('should update a activation correctly', async () => {
            const userDao = new MysqlUserDao(connection!)
            const user = await userDao.create({
                email: 'atticcat@gmail.com',
                displayName: 'Dennis',
                hashedPassword: '123454'
            })

            const activationDao = new MysqlActivationDao(connection!)

            let count = await activationDao.count()
            expect(count).toEqual(0)


            const activation1 = await activationDao.create({
                userUid: user.uid,
                token : 'abcdef1'
            })
            try {
                const activation2 = await activationDao.create({
                    userUid: user.uid,
                    token : 'abcdef1'
                })
                fail("should get error")
            } catch (err: any) {
                
            }


            const activation2 = await activationDao.create({
                userUid: user.uid,
                token : 'abcdef2'
            })

            let activation = await activationDao.get(activation1.uid)
            expect(activation).toEqual(activation1)
            activation = await activationDao.get(activation2.uid)
            expect(activation).toEqual(activation2)

            activation = await activationDao.update(activation1.uid, {
            })
            expect(activation).toEqual(activation1)

            activation = await activationDao.update(activation1.uid, {
                activatedDatetime: 1234
            })
            expect(activation).not.toEqual(activation1)
            expect(activation.uid).toEqual(activation1.uid)
            expect(activation.userUid).toEqual(activation1.userUid)
            expect(activation.token).toEqual(activation1.token)
            expect(activation.createdDatetime).toEqual(activation1.createdDatetime)
            expect(activation.activatedDatetime).toEqual(1234)


            activation = await activationDao.update(activation1.uid, {
                activatedDatetime: 5678
            })
            expect(activation).not.toEqual(activation1)
            expect(activation.uid).toEqual(activation1.uid)
            expect(activation.userUid).toEqual(activation1.userUid)
            expect(activation.token).toEqual(activation1.token)
            expect(activation.createdDatetime).toEqual(activation1.createdDatetime)
            expect(activation.activatedDatetime).toEqual(5678)


            let activationx = await activationDao.get(activation1.uid)
            expect(activationx).toEqual(activation)
            expect(activationx).not.toEqual(activation1)

            activationx = await activationDao.get(activation2.uid)
            expect(activationx).toEqual(activation2)

            //clean up
            await activationDao.deleteAll()
            count = await activationDao.count()
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

            const activationDao = new MysqlActivationDao(connection!)
            let count = await activationDao.count()
            expect(count).toEqual(0)

            for (let i = 0; i < 200; i++) {
                if (i % 2 === 0) {
                    const activation = await activationDao.create({
                        token: `abc${i}`,
                        userUid: user.uid
                    })
                } else {
                    const activation = await activationDao.create({
                        token: `xyz${i}`,
                        userUid: user.uid
                    })
                }
            }

            count = await activationDao.count()
            expect(count).toEqual(200)


            let pageAll = await activationDao.page()
            expect(pageAll.index).toEqual(0)
            expect(pageAll.totalPages).toEqual(1)
            expect(pageAll.totalItems).toEqual(200)
            expect(pageAll.pageSize).toEqual(200)
            expect(pageAll.content.length).toEqual(200)

            let activation = pageAll.content[0]
            expect(activation.token).toEqual('abc0')
            activation = pageAll.content[1]
            expect(activation.token).toEqual('xyz1')
            activation = pageAll.content[198]
            expect(activation.token).toEqual('abc198')
            activation = pageAll.content[199]
            expect(activation.token).toEqual('xyz199')


            pageAll = await activationDao.page({ orderBy: { field: 'createdDatetime', desc: true } })
            expect(pageAll.index).toEqual(0)
            expect(pageAll.totalPages).toEqual(1)
            expect(pageAll.totalItems).toEqual(200)
            expect(pageAll.pageSize).toEqual(200)
            expect(pageAll.content.length).toEqual(200)


            activation = pageAll.content[0]
            expect(activation.token).toEqual('xyz199')
            activation = pageAll.content[1]
            expect(activation.token).toEqual('abc198')
            activation = pageAll.content[198]
            expect(activation.token).toEqual('xyz1')
            activation = pageAll.content[199]
            expect(activation.token).toEqual('abc0')


            //page 0, size 10, 0-9
            let page = await activationDao.page({ pageSize: 10 })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            activation = page.content[0]
            expect(activation.token).toEqual('abc0')
            activation = page.content[1]
            expect(activation.token).toEqual('xyz1')
            activation = page.content[8]
            expect(activation.token).toEqual('abc8')
            activation = page.content[9]
            expect(activation.token).toEqual('xyz9')

            page = await activationDao.page({ index: 0, pageSize: 10 })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            activation = page.content[0]
            expect(activation.token).toEqual('abc0')
            activation = page.content[1]
            expect(activation.token).toEqual('xyz1')
            activation = page.content[8]
            expect(activation.token).toEqual('abc8')
            activation = page.content[9]
            expect(activation.token).toEqual('xyz9')

            //page 3, size 10, 30-39
            page = await activationDao.page({ index: 3, pageSize: 10 })
            expect(page.index).toEqual(3)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            activation = page.content[0]
            expect(activation.token).toEqual('abc30')
            activation = page.content[1]
            expect(activation.token).toEqual('xyz31')
            activation = page.content[8]
            expect(activation.token).toEqual('abc38')
            activation = page.content[9]
            expect(activation.token).toEqual('xyz39')


            //page 19, size 10, 190-199
            page = await activationDao.page({ index: 19, pageSize: 10 })
            expect(page.index).toEqual(19)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(10)
            activation = page.content[0]
            expect(activation.token).toEqual('abc190')
            activation = page.content[1]
            expect(activation.token).toEqual('xyz191')
            activation = page.content[8]
            expect(activation.token).toEqual('abc198')
            activation = page.content[9]
            expect(activation.token).toEqual('xyz199')


            //page 20, size 10, 190-199
            page = await activationDao.page({ index: 20, pageSize: 10 })
            expect(page.index).toEqual(20)
            expect(page.totalPages).toEqual(20)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(10)
            expect(page.content.length).toEqual(0)


            //page 0, size 15, 0 - 14
            page = await activationDao.page({ index: 0, pageSize: 15 })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(15)
            activation = page.content[0]
            expect(activation.token).toEqual('abc0')
            activation = page.content[1]
            expect(activation.token).toEqual('xyz1')
            activation = page.content[13]
            expect(activation.token).toEqual('xyz13')
            activation = page.content[14]
            expect(activation.token).toEqual('abc14')

            //page 13, size 15, 195-199
            page = await activationDao.page({ index: 13, pageSize: 15 })
            expect(page.index).toEqual(13)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(5)
            activation = page.content[0]
            expect(activation.token).toEqual('xyz195')
            activation = page.content[1]
            expect(activation.token).toEqual('abc196')
            activation = page.content[3]
            expect(activation.token).toEqual('abc198')
            activation = page.content[4]
            expect(activation.token).toEqual('xyz199')



            //page 0, size 15, desc. 199 - 185
            page = await activationDao.page({ index: 0, pageSize: 15, orderBy: { field: 'createdDatetime', desc: true } })
            expect(page.index).toEqual(0)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(15)
            activation = page.content[0]
            expect(activation.token).toEqual('xyz199')
            activation = page.content[1]
            expect(activation.token).toEqual('abc198')
            activation = page.content[13]
            expect(activation.token).toEqual('abc186')
            activation = page.content[14]
            expect(activation.token).toEqual('xyz185')

            //page 13, size 15, desc. 4 - 0
            page = await activationDao.page({ index: 13, pageSize: 15, orderBy: { field: 'createdDatetime', desc: true } })
            expect(page.index).toEqual(13)
            expect(page.totalPages).toEqual(14)
            expect(page.totalItems).toEqual(200)
            expect(page.pageSize).toEqual(15)
            expect(page.content.length).toEqual(5)
            activation = page.content[0]
            expect(activation.token).toEqual('abc4')
            activation = page.content[1]
            expect(activation.token).toEqual('xyz3')
            activation = page.content[3]
            expect(activation.token).toEqual('xyz1')
            activation = page.content[4]
            expect(activation.token).toEqual('abc0')

            //clean up
            await activationDao.deleteAll()
            count = await activationDao.count()
            expect(count).toEqual(0)

            await userDao.delete(user.uid)
        })
    })
}