import { AuthSession, AuthSessionCreate, AuthSessionUpdate, EmailActivation, EmailActivationCreate, EmailActivationUpdate, User, UserCreate, UserUpdate } from "./entity"

export type Entity = Record<string, any>

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

}

export type EmailActivationOrderBy = OrderBy<EmailActivation>
export type EmailActivationPagable = Pageable<EmailActivation>
export type EmailActivationPage = Page<EmailActivation>
export interface EmailActivationDao {

    create(activationCreate: EmailActivationCreate): Promise<EmailActivation>

    update(uid: string, activationUpdate: EmailActivationUpdate): Promise<EmailActivation>

    get(uid: string): Promise<EmailActivation>

    findByToken(token: string): Promise<EmailActivation | undefined>

    delete(uid: string): Promise<boolean>

    list(orderBy?: EmailActivationOrderBy | EmailActivationOrderBy[]): Promise<EmailActivation[]>

    page(pageable?: EmailActivationPagable): Promise<EmailActivationPage>    

    deleteAll(): Promise<void>

    count(): Promise<number>

}