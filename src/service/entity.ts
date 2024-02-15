/*
 * @author: Dennis Chen
 */

import type { Schema } from "jsonschema"

export type User = {
    uid: string
    email: string
    displayName: string
    hashedPassword: string
    createdDatetime: number
    activated: boolean
    loginCount: number
    disabled: boolean

    lastAccessDatetime?: number
    signupDomain?: string
}

export const UserCreateSchema: Schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    id: '/UserCreate',
    type: 'object',
    properties: {
        email: {
            type: 'string',
            format: 'email',
            minLength: 4,
            maxLength: 256
        },
        displayName: {
            type: 'string',
            minLength: 1,
            maxLength: 128
        },
        hashedPassword: {
            type: 'string',
            maxLength: 256
        },
        activated: {
            type: 'boolean'
        },
        disabled: {
            type: 'boolean'
        },
        signupDomain: {
            type: 'string',
            maxLength: 64
        },
    },
    required: ['email', 'displayName', 'hashedPassword'],
    additionalProperties: false
}

export type UserCreate = {
    email: string
    displayName: string
    hashedPassword: string
    activated?: boolean
    disabled?: boolean
    signupDomain?: string
}

export const UserUpdateSchema: Schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    id: '/UserUpdate',
    type: 'object',
    properties: {
        activated: {
            type: 'boolean'
        },
        displayName: {
            type: 'string',
            minLength: 1,
            maxLength: 128
        },
        hashedPassword: {
            type: 'string',
            maxLength: 256
        },
        loginCount: {
            type: 'number',
            minimum: 0
        },
        lastAccessDatetime: {
            anyOf: [
                {
                    type: 'number',
                    minimum: 0
                },
                {
                    type: 'null'
                }
            ]
        },
        disabled: {
            type: 'boolean'
        }
    },
    additionalProperties: false
}

export type UserUpdate = {
    activated?: boolean
    displayName?: string
    hashedPassword?: string
    loginCount?: number

    /**
     * nullable field
     */
    lastAccessDatetime?: number | null
    disabled?: boolean
}

export type AuthSession = {
    uid: string
    userUid: string
    token: string
    createdDatetime: number
    lastAccessDatetime: number
    invalid: boolean
    signinDomain?: string
}

export const AuthSessionCreateSchema: Schema = {
    $schema: `http://json-schema.org/draft-07/schema#`,
    id: '/AuthSessionCreate',
    type: 'object',
    properties: {
        userUid: {
            type: 'string',
            maxLength: 128
        },
        token: {
            type: 'string',
            maxLength: 256
        },
        signinDomain: {
            type: 'string',
            maxLength: 64
        },
    },
    required: ['userUid', 'token'],
    additionalProperties: false
}

export type AuthSessionCreate = {
    userUid: string
    token: string
    signinDomain?: string
}

export const AuthSessionUpdateSchema: Schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    id: '/AuthSessionUpdate',
    type: 'object',
    properties: {
        lastAccessDatetime: {
            type: 'number',
            minimum: 0
        },
        invalid: {
            type: 'boolean'
        }
    },
    additionalProperties: false
}

export type AuthSessionUpdate = {
    lastAccessDatetime?: number
    invalid?: boolean
}

export type Activation = {
    uid: string
    userUid: string
    token: string
    createdDatetime: number

    activatedDatetime?: number
}

export const ActivationCreateSchema: Schema = {
    $schema: `http://json-schema.org/draft-07/schema#`,
    id: '/ActivationCreate',
    type: 'object',
    properties: {
        userUid: {
            type: 'string',
            maxLength: 128
        },
        token: {
            type: 'string',
            maxLength: 256
        }
    },
    required: ['userUid', 'token'],
    additionalProperties: false
}

export type ActivationCreate = {
    userUid: string
    token: string
}

export const ActivationUpdateSchema: Schema = {
    $schema: `http://json-schema.org/draft-07/schema#`,
    id: '/ActivationUpdate',
    type: 'object',
    properties: {
        activatedDatetime: {
            anyOf: [
                {
                    type: 'number',
                    minimum: 0
                },
                {
                    type: 'null'
                }
            ]
        }
    },
    additionalProperties: false
}

export type ActivationUpdate = {
    /**
     * nullable field
     */
    activatedDatetime?: number | null
}


export type DailyActiveUser = {
    date: number
    count: number
    createdDatetime: number
}

export const DailyActiveUserCreateSchema: Schema = {
    $schema: `http://json-schema.org/draft-07/schema#`,
    id: '/DailyActiveUserCreate',
    type: 'object',
    properties: {
        date: {
            type: 'number',
            description: "date by 'YYYYMMDD'(e.g. 20240215) format in UTC0"
        },
        count: {
            type: 'number',
            minimum: 0,
            description: "active user count"
        }
    },
    required: ['date', 'count'],
    additionalProperties: false
}

export type DailyActiveUserCreate = {
    date: number
    count: number
}

export const DailyActiveUserUpdateSchema: Schema = {
    $schema: `http://json-schema.org/draft-07/schema#`,
    id: '/DailyActiveUserUpdate',
    type: 'object',
    properties: {
        count: {
            type: 'number',
            minimum: 0,
        }
    },
    additionalProperties: false
}

export type DailyActiveUserUpdate = {

    count?: number
}