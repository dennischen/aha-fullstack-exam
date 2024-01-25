
/*
 * @author: Dennis Chen
 */

import { Activation, AuthSession, User } from "@/service/entity"
import { sendMail } from "@/service/utils"
import { Schema, Validator } from "jsonschema"
import moment from "moment"
import { NextRequest } from "next/server"
import PasswordHash from 'password-hash'
import UIDGenerator from 'uid-generator'
import { ApiError } from "."
import { ActivationFormSchema, AuthenticationFormSchema, OrderBySchema, SigninFormSchema, SignupFormSchema, UpdatePasswordFormSchema, UpdateProfileFormSchema, UserInfoQuerySchema, passwordPattern, passwordPatternMsg } from "./dto"

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

export async function validatePasswordRule(password: string) {
    if (!passwordPattern.test(password)) {
        throw new ApiError(passwordPatternMsg, 400)
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

    const appName = process.env.APP_NAME
    const appBaseUrl = process.env.WEB_BASE_URL
    const activationUrl = `${appBaseUrl}/home/activate?token=${encodeURIComponent(activation.token)}`
    const datetime = moment().format()
    const html =
        [`Dear ${user.displayName},`,
        `Thank you for registering with ${appName}!`,
            `To activate your account, please click on the following activation link:`,
        `<a href='${activationUrl}'>${activationUrl}</a>`,
        `If you didn't register for the ${appName} service, kindly ignore this email.`,
            `Best regards,`,
        `${appName} Team`,
        `${datetime}`
        ]
    await sendMail({
        to: user.email,
        subject: `Activate Your Account for ${appName}`,
        html: html.join('<br/>')
    })
    console.log(`Mail sent to ${user.displayName} ${user.email}`)

}