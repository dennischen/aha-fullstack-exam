import { Schema } from "jsonschema"


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
}

export const UserCreateSchema: Schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
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
        }
    },
    required: ['email', 'displayName', 'hashedPassword'],
    additionalProperties: false
}

export type UserCreate = {
    email: string
    displayName: string
    hashedPassword: string,
    activated?: boolean
    disabled?: boolean
}

export const UserUpdateSchema: Schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
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
            type: 'number'
        },
        lastAccessDatetime: {
            anyOf: [
                {
                    type: 'number'
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
}

export const AuthSessionCreateSchema: Schema = {
    $schema: `http://json-schema.org/draft-07/schema#`,
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

export type AuthSessionCreate = {
    userUid: string
    token: string
}

export const AuthSessionUpdateSchema: Schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
        lastAccessDatetime: {
            type: 'number'
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
    type: 'object',
    properties: {
        activatedDatetime: {
            anyOf: [
                {
                    type: 'number'
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

