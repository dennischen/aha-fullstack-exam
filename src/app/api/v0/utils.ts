import { Schema, Validator } from "jsonschema"
import { ApiContext, ApiError } from "."
import { NextRequest } from "next/server"
import { ServiceError } from "@/service"
import { CommonResponse } from "./dto"
import { ActivationFormSchema, AuthenticationFormSchema, OrderBySchema, SigninFormSchema, SignupFormSchema, UpdatePasswordFormSchema, UpdateProfileFormSchema, UserInfoQuerySchema } from "./dto"


export const dtoSchemaValidator = new Validator()
dtoSchemaValidator.addSchema(OrderBySchema)
dtoSchemaValidator.addSchema(ActivationFormSchema)
dtoSchemaValidator.addSchema(AuthenticationFormSchema)
dtoSchemaValidator.addSchema(SigninFormSchema)
dtoSchemaValidator.addSchema(SignupFormSchema)
dtoSchemaValidator.addSchema(UpdatePasswordFormSchema)
dtoSchemaValidator.addSchema(UpdateProfileFormSchema)
dtoSchemaValidator.addSchema(UserInfoQuerySchema)

export async function validateApiArgument<T>(instance: T, schema: Schema) {
    const r = dtoSchemaValidator.validate(instance, schema, { required: true })
    if (!r.valid) {
        throw new ApiError(r.errors.map((err) => `${err.property} ${err.message}`).join(", "), 400)
    }
    return instance
}


export async function validateJson(req: NextRequest) {
    const contentType = req.headers.get('Content-Type')

    if (!contentType || contentType.indexOf('application/json') < 0) {
        throw new ApiError(`unsupported content type ${contentType}`, 400)
    }

    try {
        return await req.json()
    } catch (err: any) {
        //json parse error only?
        throw new ApiError(err, 400)
    }
}

class ApiContextImpl implements ApiContext {
    release() {
    }
}


export async function withApiContext(task: (context: ApiContext) => Promise<Response>) {
    const context = new ApiContextImpl()
    try {

        return await task(context)
    } catch (err: any) {
        if (err instanceof ApiError || err instanceof ServiceError) {
            return Response.json({ message: err.message, error: true } as CommonResponse, { status: err.code || 400 })
        }
        console.error(err)
        return Response.json({ message: err?.message ?? 'Unknown error', error: true } as CommonResponse, { status: 500 })
    } finally {
        context.release()
    }
}