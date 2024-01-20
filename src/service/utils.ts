import { Schema, Validator } from "jsonschema"
import { ServiceError } from "."
import { OrderBySchema, PageableSchema } from "./dao"
import { ActivationCreateSchema, ActivationUpdateSchema, AuthSessionCreateSchema, AuthSessionUpdateSchema, UserCreateSchema, UserUpdateSchema } from "./entity"




export const entitySchemaValidator = new Validator()
entitySchemaValidator.addSchema(PageableSchema)
entitySchemaValidator.addSchema(OrderBySchema)
entitySchemaValidator.addSchema(UserCreateSchema)
entitySchemaValidator.addSchema(UserCreateSchema)
entitySchemaValidator.addSchema(UserUpdateSchema)
entitySchemaValidator.addSchema(AuthSessionCreateSchema)
entitySchemaValidator.addSchema(AuthSessionUpdateSchema)
entitySchemaValidator.addSchema(ActivationCreateSchema)
entitySchemaValidator.addSchema(ActivationUpdateSchema)

export async function validateServiceArgument<T>(instance: T, schema: Schema) {
    const r = entitySchemaValidator.validate(instance, schema, { required: true })
    if (!r.valid) {
        throw new ServiceError(r.errors.map((err) => `${err.property} ${err.message}`).join(", "), 400)
    }
    return instance
}