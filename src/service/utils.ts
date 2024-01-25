/*
 * @author: Dennis Chen
 */

import { Schema, Validator } from "jsonschema"
import { ServiceError } from "."
import { OrderBySchema, PageableSchema } from "./dao"
import { ActivationCreateSchema, ActivationUpdateSchema, AuthSessionCreateSchema, AuthSessionUpdateSchema, UserCreateSchema, UserUpdateSchema } from "./entity"

import nodemailer, { Transporter } from 'nodemailer'
import SMTPTransport from "nodemailer/lib/smtp-transport"


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


let mailTransporter: Transporter<SMTPTransport.SentMessageInfo> | undefined

export async function sendMail(mail: { to: string | string[], subject: string, html: string }) {

    const { to, subject, html } = mail

    if(process.env.DUMMY_MAILER){
        console.log("---DummyMailer:", mail)
        return;
    }

    if (!mailTransporter) {
        mailTransporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        })
    }
    try {
        return await mailTransporter.sendMail({
            to: typeof to === 'string' ? to : to.join(','),
            bcc: process.env.SMTP_BCC,
            subject: subject,
            html: `${html ?? ''} <br/><hr/><p>This email was sent by an automated process; please do not reply directly</p>`,
        })
    } catch (err) {
        mailTransporter = undefined
        throw err
    }

}