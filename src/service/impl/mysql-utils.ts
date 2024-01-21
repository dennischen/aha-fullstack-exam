import { Entity, OrderBy } from '@/service/dao'
import { Connection, FieldInfo, MysqlError, Pool, PoolConnection, QueryOptions } from 'mysql'

export async function getConnection(pool: Pool) {
    return new Promise<PoolConnection>((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err)
            } else {
                resolve(connection)
            }
        })
    })
}

export async function connect(connection: Connection): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        connection.connect((err: MysqlError) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

export async function end(connection: Connection): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        connection.end((err: MysqlError | undefined) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

export async function beginTransaction(connection: Connection): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        connection.beginTransaction((err: MysqlError) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

export async function commit(connection: Connection): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        connection.commit((err: MysqlError) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

export async function rollback(connection: Connection): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        connection.rollback((err: MysqlError) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}


export async function query<T>(connection: Connection, query: string | QueryOptions): Promise<{ results: T, fields?: FieldInfo[] }>
export async function query<T>(connection: Connection, query: string | QueryOptions, value?: any): Promise<{ results: T, fields?: FieldInfo[] }>
export async function query<T>(connection: Connection, query: string | QueryOptions, value?: any): Promise<{ results: T, fields?: FieldInfo[] }> {
    return new Promise<{ results: T, fields?: FieldInfo[] }>((resolve, reject) => {
        connection.query(query, value, (err: MysqlError | null, results?: any, fields?: FieldInfo[]) => {
            if (err) {
                reject(err)
            } else {
                resolve({ results, fields })
            }
        })
    })
}



export function toOrderByExpression<T extends Entity>(orderBy?: OrderBy<T> | OrderBy<T>[]) {
    if (!orderBy || (Array.isArray(orderBy) && orderBy.length == 0)) {
        return ''
    }
    return (Array.isArray(orderBy) ? orderBy : [orderBy]).map((orderBy) => `${String(orderBy.field)} ${orderBy.desc ? 'DESC' : 'ASC'}`).join(',')
}
