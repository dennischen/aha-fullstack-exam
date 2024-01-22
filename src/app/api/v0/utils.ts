import { Activation, AuthSession, User } from "@/service/entity"
import { Schema, Validator } from "jsonschema"
import { NextRequest } from "next/server"
import PasswordHash from 'password-hash'
import UIDGenerator from 'uid-generator'
import { ApiError } from "."
import { ActivationFormSchema, AuthenticationFormSchema, OrderBySchema, SigninFormSchema, SignupFormSchema, UpdatePasswordFormSchema, UpdateProfileFormSchema, UserInfoQuerySchema } from "./dto"

const activationTokenGenerator = new UIDGenerator(256, UIDGenerator.BASE58)
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
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=])[a-zA-Z\d!@#$%^&*()\-_+=]{8,}$/

export async function validatePasswordRule(password: string) {
    if (!passwordRegex.test(password)) {
        throw new ApiError('Ensure your password is at least 8 characters long and includes at least one lowercase, one uppercase, one digit, and one special character.', 400)
    }
    return password
}

export async function hashPassword(password: string) {
    return PasswordHash.generate(password, { algorithm: 'sha1', saltLength: 8, iterations: 1 })
}

export async function verifyPassword(password: string, hashedPassword: string) {
    return PasswordHash.verify(password, hashedPassword)
}

export async function generateActivationToken() {
    return await activationTokenGenerator.generate()
}

export async function generateAuthSessionToken() {
    return await authSessionTokenGenerator.generate()
}

export function responseJson<T>(data: T, init?: ResponseInit) {
    return Response.json(data, init)
}


export async function sendActivationEamil(user: User, activation: Activation) {
    //TODO
    console.log(">>Send email to ", user.email, activation.token)
}