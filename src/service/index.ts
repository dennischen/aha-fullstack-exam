
/*
 * @author: Dennis Chen
 */

import { ActivationDao, AuthSessionDao, DailyActiveUserDao, UserDao } from "./dao"

export class ServiceError extends Error {
    readonly code: number | undefined

    constructor(message?: string, code?: number, options?: ErrorOptions) {
        super(message, options)
        this.code = code
    }
}


export interface ServiceContext {

    getUserDao(): Promise<UserDao>

    getAuthSessionDao(): Promise<AuthSessionDao>

    getActivationDao(): Promise<ActivationDao>

    getDailyActiveUserDao(): Promise<DailyActiveUserDao>

    hasTx(): boolean

    beginTx(): Promise<void>

    commit(): Promise<void>

    rollback(): Promise<void>

    release(): Promise<void>
}