import { Validator } from "jsonschema"

import { ActivationFormSchema, AuthenticationFormSchema, OrderBySchema, SigninFormSchema, SignupFormSchema, UpdatePasswordFormSchema, UpdateProfileFormSchema, UserInfoQuerySchema } from "./dto"


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

export const validator = new Validator()
validator.addSchema(OrderBySchema)
validator.addSchema(ActivationFormSchema)
validator.addSchema(AuthenticationFormSchema)
validator.addSchema(SigninFormSchema)
validator.addSchema(SignupFormSchema)
validator.addSchema(UpdatePasswordFormSchema)
validator.addSchema(UpdateProfileFormSchema)
validator.addSchema(UserInfoQuerySchema)