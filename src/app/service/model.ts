

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
    emailVerified?: boolean | null
    displayName?: string | null
    hashedPassword?: string | null
    loginCount?: number | null
    lastAccessDatetime?: number | null
    disabled?: boolean | null
}

export type AuthSession = {
    uid: string
    userUid: string
    token: string
    createdDatetime: number
    lastAccessDatetime: number
    invalidate: boolean
}

export type AuthSessionCreate = {
    userUid: string
    token: string
}

export type AuthSessionUpdate = {
    lastAccessDatetime: number | null
    invalidate: boolean | null
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
    verifiedDatetime?: number | null
}

