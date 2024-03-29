
/*
 * @author: Dennis Chen
 */

import { ActivationDao, AuthSessionDao, DailyActiveUserDao, UserDao } from "@/service/dao"

export class ApiError extends Error {

    readonly code: number | undefined

    constructor(message?: string, code?: number, options?: ErrorOptions) {
        super(message, options)
        this.code = code
    }


}
export interface ApiContext {

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