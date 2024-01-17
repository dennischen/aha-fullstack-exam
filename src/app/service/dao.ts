import { AuthSession, AuthSessionCreate, AuthSessionUpdate, EmailVerification, EmailVerificationCreate, EmailVerificationUpdate, User, UserCreate, UserUpdate } from "./model"

export type Entity = Record<string, any>

export type Pageable<T extends Entity> = {
    /**
     * index of the page to query, e.g. page 0, page 1, page 2
     */
    index: number
    /**
     * size of the page, e.g. 20, 50, 100
     */
    size: number

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
    total: number

    /**
     * total number of the items
     */
    totalItem: number

    /**
     * item instance in this page
     */
    items: T[]
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

export interface AuthSessionDao {

    create(sessionCreate: AuthSessionCreate): Promise<AuthSession>

    update(uid: string, sessionUpdate: AuthSessionUpdate): Promise<AuthSession>

    get(uid: string): Promise<AuthSession>

    findByToken(token: string): Promise<AuthSession | undefined>

    delete(uid: string): Promise<boolean>

    deleteAll(): Promise<void>

    count(): Promise<number>

}

export interface EmailVerificationDao {

    create(verificationCreate: EmailVerificationCreate): Promise<EmailVerification>

    update(uid: string, verificationUpdate: EmailVerificationUpdate): Promise<EmailVerification>

    get(uid: string): Promise<EmailVerification>

    findByToken(token: string): Promise<EmailVerification | undefined>

    delete(uid: string): Promise<boolean>

    deleteAll(): Promise<void>

    count(): Promise<number>

}