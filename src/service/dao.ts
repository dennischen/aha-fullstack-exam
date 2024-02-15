/*
 * @author: Dennis Chen
 */

import type { Schema } from "jsonschema"
import type {
    AuthSession, AuthSessionCreate, AuthSessionUpdate, Activation, ActivationCreate, ActivationUpdate,
    User, UserCreate, UserUpdate, DailyActiveUserCreate, DailyActiveUser, DailyActiveUserUpdate
} from "./entity"

export type Entity = Record<string, any>


export const PageableSchema: Schema = {
    $schema: `http://json-schema.org/draft-07/schema#`,
    id: '/Pageable',
    type: 'object',
    properties: {
        index: {
            type: 'number',
            minimum: 0

        },
        pageSize: {
            type: 'number',
            minimum: 1
        },
        orderBy: {
            anyOf: [
                {
                    $ref: '/OrderBy'
                },
                {
                    type: 'array',
                    items: {
                        $ref: '/OrderBy'
                    }
                }
            ]
        }
    },
    additionalProperties: false
}

export type Pageable<T extends Entity> = {
    /**
     * index of the page to query, e.g. page 0, page 1, page 2
     */
    index?: number
    /**
     * size of the page, e.g. 20, 50, 100
     */
    pageSize?: number

    /**
     * orderby for the query
     */
    orderBy?: OrderBy<T> | OrderBy<T>[]
}

export type Page<T> = {
    /**
     * index of the page from query, e.g. page 0, page 1, page 2
     */
    index: number

    /**
     * total number of the page from query, e.g. 10, 20
     */
    totalPages: number

    /**
     * size of the page from query, the size may large than items.length if it reach to last page
     */
    pageSize: number


    /**
     * total number of the items
     */
    totalItems: number

    /**
     * number of the items in this page
     */
    numItems: number

    /**
     * item instance in this page
     */
    content: T[]
}

export const OrderBySchema: Schema = {
    $schema: `http://json-schema.org/draft-07/schema#`,
    id: '/OrderBy',
    type: 'object',
    properties: {
        field: {
            type: 'string'
        },
        desc: {
            type: 'boolean'
        }
    },
    required: ['field'],
    additionalProperties: false
}
export type OrderBy<T extends Entity, F = keyof T> = {
    field: F,
    desc?: boolean
}

export type UserOrderBy = OrderBy<User>
export type UserPagable = Pageable<User>
export type UserPage = Page<User>
export interface UserDao {

    create(userCreate: UserCreate): Promise<User>

    update(uid: string, userUpdate: UserUpdate): Promise<User>

    get(uid: string): Promise<User>

    findByEmail(email: string): Promise<User | undefined>

    delete(uid: string): Promise<boolean>

    list(orderBy?: UserOrderBy | UserOrderBy[]): Promise<User[]>

    page(pageable?: UserPagable): Promise<UserPage>

    deleteAll(): Promise<void>

    count(): Promise<number>

}

export type AuthSessionOrderBy = OrderBy<AuthSession>
export type AuthSessionPagable = Pageable<AuthSession>
export type AuthSessionPage = Page<AuthSession>
export interface AuthSessionDao {

    create(sessionCreate: AuthSessionCreate): Promise<AuthSession>

    update(uid: string, sessionUpdate: AuthSessionUpdate): Promise<AuthSession>

    get(uid: string): Promise<AuthSession>

    findByToken(token: string): Promise<AuthSession | undefined>

    delete(uid: string): Promise<boolean>

    list(orderBy?: AuthSessionOrderBy | AuthSessionOrderBy[]): Promise<AuthSession[]>

    page(pageable?: AuthSessionPagable): Promise<AuthSessionPage>

    deleteAll(): Promise<void>

    count(): Promise<number>

    countActiveUserBetween(startDatetime: number, endDatetime: number): Promise<number>

}

export type ActivationOrderBy = OrderBy<Activation>
export type ActivationPagable = Pageable<Activation>
export type ActivationPage = Page<Activation>
export interface ActivationDao {

    create(activationCreate: ActivationCreate): Promise<Activation>

    update(uid: string, activationUpdate: ActivationUpdate): Promise<Activation>

    get(uid: string): Promise<Activation>

    findByToken(token: string): Promise<Activation | undefined>

    delete(uid: string): Promise<boolean>

    list(orderBy?: ActivationOrderBy | ActivationOrderBy[]): Promise<Activation[]>

    page(pageable?: ActivationPagable): Promise<ActivationPage>

    deleteAll(): Promise<void>

    count(): Promise<number>

}

export interface DailyActiveUserDao {

    create(dailActivateUserCreate: DailyActiveUserCreate): Promise<DailyActiveUser>

    update(date: number, dailActivateUserUser: DailyActiveUserUpdate): Promise<DailyActiveUser>

    get(date: number): Promise<DailyActiveUser>

    delete(date: number): Promise<boolean>

    list(dateStart: number, dateEnd: number): Promise<DailyActiveUser[]>

    deleteAll(): Promise<void>

    count(): Promise<number>

}