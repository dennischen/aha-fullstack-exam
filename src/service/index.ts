import { Validator } from "jsonschema"
import { ActivationCreateSchema, ActivationUpdateSchema, AuthSessionCreateSchema, AuthSessionUpdateSchema, UserCreateSchema, UserUpdateSchema } from "./entity"
import { OrderBySchema, PageableSchema } from "./dao"


export class ServiceError extends Error {

    readonly code: number | undefined

    constructor(message?: string, code?: number, options?: ErrorOptions) {
        super(message, options)
        this.code = code
    }

    
}


export const validator = new Validator()
validator.addSchema(PageableSchema)
validator.addSchema(OrderBySchema)
validator.addSchema(UserCreateSchema)
validator.addSchema(UserCreateSchema)
validator.addSchema(UserUpdateSchema)
validator.addSchema(AuthSessionCreateSchema)
validator.addSchema(AuthSessionUpdateSchema)
validator.addSchema(ActivationCreateSchema)
validator.addSchema(ActivationUpdateSchema)