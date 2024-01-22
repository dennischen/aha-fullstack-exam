import { Schema } from "jsonschema"


const displayNamePattern = /^(?!\s)(.*\S)$/g

/**
 * @swagger
 * components:
 *   schemas:
 *     IdObject:
 *       type: object
 *       properties:
 *         id: 
 *           type: string
 *           description: 'Arbitrary string.'
 *       required:
 *         - id
 */
export type IdObject = {
    id: string
}

/**
 * @swagger
 * components:
 *   schemas:
 *     SignupForm:
 *       type: object
 *       properties:
 *         email: 
 *           type: string
 *           description: 'Email address, it is alos the account in the system.'
 *           example: 'foo@bar.net'
 *         displayName: 
 *           type: string
 *           description: 'Name to display.'
 *           example: 'Foo Bar'
 *         password: 
 *           type: string
 *           description: 'User password for signin, is at least 8 characters long and includes at least one lowercase, one uppercase, one digit, and one special character.'
 *           example: 'P@sSw0rD'
 *       required:
 *         - email
 *         - displayName
 *         - password
 */
export const SignupFormSchema: Schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    id: '/SignupForm',
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
            pattern: displayNamePattern,
            minLength: 1,
            maxLength: 128
            
        },
        password: {
            type: 'string'
        }
    },
    required: ['email', 'displayName', 'password'],
    additionalProperties: false
}
export type SignupForm = {
    email: string,
    displayName: string,
    password: string
}

/**
 * @swagger
 * components:
 *   schemas:
 *     SigninForm:
 *       type: object
 *       properties:
 *         email: 
 *           type: string
 *           description: 'Email address, the account of the system.'
 *           example: 'foo@bar.net'
 *         password: 
 *           type: string
 *           description: 'User password.'
 *           example: 'P@sSw0rD'
 *       required:
 *         - email
 *         - password
 */
export const SigninFormSchema: Schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    id: '/SigninForm',
    type: 'object',
    properties: {
        email: {
            type: 'string'
        },
        password: {
            type: 'string'
        }
    },
    required: ['email', 'password'],
    additionalProperties: false
}
export type SigninForm = {
    email: string,
    password: string
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Authentication:
 *       type: object
 *       properties:
 *         authToken: 
 *           type: string
 *           description: 'Authentication token for user.'
 *         profile:
 *           $ref : '#/components/schemas/Profile'
 *       required:
 *         - authToken
 *         - email
 *         - displayName
 *         - activated
 */
export type Authentication = {
    authToken: string,
    profile: Profile
}


/**
 * @swagger
 * components:
 *   schemas:
 *     AuthenticationForm:
 *       type: object
 *       properties:
 *         authToken: 
 *           type: string
 *           description: 'Authentication token of user.'
 *       required:
 *         - authToken
 */
export const AuthenticationFormSchema: Schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    id: '/AuthenticationForm',
    type: 'object',
    properties: {
        authToken: {
            type: 'string'
        }
    },
    required: ['authToken'],
    additionalProperties: false
}
export type AuthenticationForm = {
    authToken: string
}


/**
 * @swagger
 * components:
 *   schemas:
 *     ActivationForm:
 *       type: object
 *       properties:
 *         token: 
 *           type: string
 *           description: 'activation token.'
 *       required:
 *         - token
 */
export const ActivationFormSchema: Schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    id: '/ActivationForm',
    type: 'object',
    properties: {
        token: {
            type: 'string'
        }
    },
    required: ['token'],
    additionalProperties: false
}
export type ActivationForm = {
    token: string
}


/**
 * @swagger
 * components:
 *   schemas:
 *     CommonResponse:
 *       type: object
 *       properties:
 *         message: 
 *           type: string
 *           description: 'Descriptive message from the server.'
 *         code: 
 *           type: string
 *           description: 'Indicates system definded code of this response.'
 *         error: 
 *           type: boolean
 *           description: 'Indicates whether an error occurred.'
 *       required:
 *         - message
 */
export type CommonResponse = {
    message: string
    code?: string
    error?: boolean
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       properties:
 *         email: 
 *           type: string
 *           description: 'User email address.'
 *         displayName: 
 *           type: string
 *           description: 'User display name.'
 *         activated: 
 *           type: boolean
 *           description: 'User is activated or not'
 *       required:
 *         - email
 *         - displayName
 */
export type Profile = {
    email: string,
    displayName: string
    activated: boolean
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateProfileForm:
 *       type: object
 *       properties:
 *         displayName: 
 *           type: string
 *           description: "New display name for the user"
 *           example: 'Qoo Bee'
 *       required:
 *         - displayName
 */
export const UpdateProfileFormSchema: Schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    id: '/',
    type: 'object',
    properties: {
        displayName: {
            type: 'string',
            pattern: displayNamePattern,
            minLength: 1,
            maxLength: 128
        }
    },
    required: ['displayName'],
    additionalProperties: false
}
export type UpdateProfileForm = {
    displayName: string
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdatePasswordForm:
 *       type: object
 *       properties:
 *         password: 
 *           type: string
 *           description: 'Current user password.'
 *           example: 'P@sSw0rD'
 *         newPassword: 
 *           type: string
 *           description: 'New user password.'
 *           example: 'NeWP@sSw0rD'
 *       required:
 *         - password
 *         - newPassword
 */
export const UpdatePasswordFormSchema: Schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    id: '/UpdatePasswordForm',
    type: 'object',
    properties: {
        password: {
            type: 'string'
        },
        newPassword: {
            type: 'string'
        }
    },
    required: ['password', 'newPassword'],
    additionalProperties: false
}
export type UpdatePasswordForm = {
    password: string
    newPassword: string
}


/**
 * @swagger
 * components:
 *   schemas:
 *     UserStatistics:
 *       type: object
 *       properties:
 *         totalSignedUpUser: 
 *           type: number
 *           description: 'Total number of users who have signed up.'
 *         totalActiveUserToday: 
 *           type: number
 *           description: 'Total number of users with active sessions today.'
 *         avgActiveUserIn7Days: 
 *           type: number
 *           description: 'Average number of active session users in the last 7 days rolling.'
 *       required:
 *         - totalSignedUpUser
 *         - totalActiveUserToday
 *         - avgActiveUserIn7Days
 */
export type UserStatistics = {
    totalSignedUpUser: number,
    totalActiveUserToday: number,
    avgActiveUserIn7Days: number
}


/**
 * @swagger
 * components:
 *   schemas:
 *     UserInfo:
 *       type: object
 *       properties:
 *         email: 
 *           type: string
 *           description: "User's email address"
 *         displayName: 
 *           type: string
 *           description: "User's display name"
 *         signedupDatetime: 
 *           type: number
 *           description: 'Timestamp of user sign-up'
 *         loginCount: 
 *           type: number
 *           description: 'Number of times the user has logged in'
 *         lastAccessDatetime: 
 *           type: number
 *           description: 'Timestamp of the last user access'
 *       required:
 *         - email
 *         - displayName
 *         - signedupDatetime
 *         - loginCount
 */
export type UserInfo = {
    email: string,
    displayName: string,
    signedupDatetime: number,
    loginCount: number,
    lastAccessDatetime?: number
}


/**
 * @swagger
 * components:
 *   schemas:
 *     OrderBy:
 *       type: object
 *       properties:
 *         field: 
 *           type: string
 *           description: 'The field by which to sort'
 *         desc: 
 *           type: boolean
 *           description: 'Sort by descending order'
 *       required:
 *         - field
 */
export const OrderBySchema: Schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    id: '/OrderBy',
    type: 'object',
    properties: {
        field: {
            type: 'string',
            minLength: 1
        },
        desc: {
            type: 'boolean'
        }
    },
    required: ['field'],
    additionalProperties: false
}
export type OrderBy = {
    field: string,
    desc?: boolean,
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserInfoQuery:
 *       type: object
 *       properties:
 *         index: 
 *           type: number
 *           description: 'The page index, zero-based'
 *         pageSize: 
 *           type: number
 *           description: 'The item size per page.'
 *         orderBy:
 *           $ref : '#/components/schemas/OrderBy'
 *       required:
 *         - index
 *         - pageSize
 */
export const UserInfoQuerySchema: Schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    id: '/UserInfoQuery',
    type: 'object',
    properties: {
        index: {
            type: 'number',
            minimum: 0
        },
        pageSize: {
            type: 'number',
            minimum: 1
        },
        orderBy: {
            $ref: '/OrderBy'
        }
    },
    required: ['index', 'pageSize'],
    additionalProperties: false,
}
export type UserInfoQuery = {
    index: number,
    pageSize: number,
    orderBy?: OrderBy
}


/**
 * @swagger
 * components:
 *   schemas:
 *     UserInfoPage:
 *       type: object
 *       properties:
 *         index: 
 *           type: number
 *           description: 'Index of the page from the query.'
 *         pageSize: 
 *           type: number
 *           description: 'Size of the page from the query.'
 *         totalPages:
 *           type: number
 *           description: 'Total number of pages in the query.'
 *         totalItems:
 *           type: number
 *           description: 'Total number of items.'
 *         numItems:
 *           type: number
 *           description: 'Number of items in this page'
 *         content:
 *           type: array
 *           description: 'Item instances in this page.'
 *           items:
 *             $ref : '#/components/schemas/UserInfo'
 *       required:
 *         - index
 *         - pageSize
 *         - totalPages
 *         - totalItems
 *         - numItems
 *         - content
 */
export type UserInfoPage = {
    index: number,
    pageSize: number,
    totalPages: number,
    totalItems: number,
    numItems: number,
    content: UserInfo[]
}
