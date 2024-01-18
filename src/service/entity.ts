

export type User = {
    uid: string
    email: string
    displayName: string
    hashedPassword: string
    createdDatetime: number
    emailVerified: boolean
    loginCount: number
    disabled: boolean

    lastAccessDatetime?: number
}

export type UserCreate = {
    email: string
    displayName: string
    hashedPassword: string,
    emailVerified?: boolean
    disabled?: boolean
}

export type UserUpdate = {
    emailVerified?: boolean
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

export type EmailVerification = {
    uid: string
    userUid: string
    token: string
    createdDatetime: number

    verifiedDatetime?: number
}

export type EmailVerificationCreate = {
    userUid: string
    token: string
}

export type EmailVerificationUpdate = {
    /**
     * nullable field
     */
    verifiedDatetime?: number | null
}

