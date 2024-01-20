
export class ApiError extends Error {

    readonly code: number | undefined

    constructor(message?: string, code?: number, options?: ErrorOptions) {
        super(message, options)
        this.code = code
    }


}
export interface ApiContext {

    release(): void
}