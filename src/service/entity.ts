

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

export type UserCreate = {
    email: string
    displayName: string
    hashedPassword: string,
    acativated?: boolean
    disabled?: boolean
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

export type AuthSessionCreate = {
    userUid: string
    token: string
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

export type ActivationCreate = {
    userUid: string
    token: string
}

export type ActivationUpdate = {
    /**
     * nullable field
     */
    activatedDatetime?: number | null
}

