import { Connection, FieldInfo, MysqlError, Pool, PoolConnection, QueryOptions } from 'mysql'
import { Entity, OrderBy } from './dao'

export async function getConnection(pool: Pool) {
    return new Promise<PoolConnection>((resolve, reject) => {
        pool!.getConnection((err, connection) => {
            if (err) {
                reject(err)
            } else {
                resolve(connection)
            }
        })
    })
}


export function query<T>(connection: Connection, query: string | QueryOptions): Promise<{ results: T, fields?: FieldInfo[] }>
export function query<T>(connection: Connection, query: string | QueryOptions, value?: any): Promise<{ results: T, fields?: FieldInfo[] }>
export function query<T>(connection: Connection, query: string | QueryOptions, value?: any): Promise<{ results: T, fields?: FieldInfo[] }> {
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
    return 'ORDER BY ' + (Array.isArray(orderBy) ? orderBy : [orderBy]).map((orderBy) => `${String(orderBy.field)} ${orderBy.desc ? 'DESC' : 'ASC'}`).join(',')
}