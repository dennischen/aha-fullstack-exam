
/*
 * @author: Dennis Chen
 */

export class ServiceError extends Error {
    readonly code: number | undefined

    constructor(message?: string, code?: number, options?: ErrorOptions) {
        super(message, options)
        this.code = code
    }
}
