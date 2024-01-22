import { ServiceError } from "@/service"
import { Schema, Validator } from "jsonschema"
import { NextRequest } from "next/server"
import { ApiContext, ApiError } from "."
import MySqlApiContext from "./MySqlApiContext"
import { ActivationFormSchema, AuthenticationFormSchema, CommonResponse, OrderBySchema, SigninFormSchema, SignupFormSchema, UpdatePasswordFormSchema, UpdateProfileFormSchema, UserInfoQuerySchema } from "./dto"
import UIDGenerator from 'uid-generator'
import PasswordHash from 'password-hash'
import { AuthSession } from "@/service/entity"

const verificationTokenGenerator = new UIDGenerator(256, UIDGenerator.BASE58)
const authSessionTokenGenerator = new UIDGenerator(512, UIDGenerator.BASE58)

export const dtoSchemaValidator = new Validator()
dtoSchemaValidator.addSchema(OrderBySchema)
dtoSchemaValidator.addSchema(ActivationFormSchema)
dtoSchemaValidator.addSchema(AuthenticationFormSchema)
dtoSchemaValidator.addSchema(SigninFormSchema)
dtoSchemaValidator.addSchema(SignupFormSchema)
dtoSchemaValidator.addSchema(UpdatePasswordFormSchema)
dtoSchemaValidator.addSchema(UpdateProfileFormSchema)
dtoSchemaValidator.addSchema(UserInfoQuerySchema)


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

export async function validateAuthToken(req: NextRequest) {
    const authToken = req.headers.get('authToken')

    if (!authToken) {
        throw new ApiError(`No Authentication token (authToken) in header`, 401)
    }

    return authToken
}

export async function validateApiArgument<T>(instance: T, schema: Schema) {
    const r = dtoSchemaValidator.validate(instance, schema, { required: true })
    if (!r.valid) {
        throw new ApiError(r.errors.map((err) => `${err.property} ${err.message}`).join(", "), 400)
    }
    return instance
}

export async function validateAuthSession(authSession: AuthSession | undefined) {

    if (!authSession || authSession.invalid) {
        throw new ApiError(`Authentication session is not available`, 401)
    }
    
    return authSession
}


//test at https://regex101.com/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=])[a-zA-Z\d!@#$%^&*()\-_+=]{8,}$/g

export async function validatePasswordRule(password:string){
    if(!passwordRegex.test(password)){
        throw new ApiError('Ensure your password is at least 8 characters long and includes at least one lowercase, one uppercase, one digit, and one special character.', 400)
    }
}

export async function hashPassword(password: string) {
    return PasswordHash.generate(password, { algorithm: 'sha1', saltLength: 8, iterations: 1 })
}

export async function verifyPassword(password: string, hashedPassword: string) {
    return PasswordHash.verify(password, hashedPassword)
}

export async function generateVerficationToken() {
    return await verificationTokenGenerator.generate()
}

export async function generateAuthSessionToken() {
    return await authSessionTokenGenerator.generate()
}


export async function withApiContext(task: (context: ApiContext) => Promise<Response>) {
    const context = new MySqlApiContext()
    try {
        const response = await task(context)
        if (context.hasTx()) {
            await context.commit()
        }
        return response
    } catch (err: any) {
        if (context.hasTx()) {
            await context.rollback()
        }
        if (err instanceof ApiError) {
            return responseJson<CommonResponse>({ message: err.message, error: true }, { status: err.code || 400 })
        } else if (err instanceof ServiceError) {
            if(err.code && err.code < 500 && err.code >= 400){
                return responseJson<CommonResponse>({ message: err.message, error: true }, { status: err.code})
            }else{
                console.error("An service error in api context.", err)
                return responseJson<CommonResponse>({ message: err.message, error: true }, { status: 500 })
            }
        }
        console.error("An unknow error in api context.", err)
        return responseJson<CommonResponse>({ message: err?.message ?? 'Unknown error', error: true }, { status: 500 })
    } finally {
        await context.release()
    }
}

export function responseJson<T>(data: T, init?: ResponseInit) {
    return Response.json(data, init)
}