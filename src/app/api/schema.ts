
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
 *         displayName: 
 *           type: string
 *           description: 'Name to display.'
 *         password: 
 *           type: string
 *           description: 'User password for signin.'
 *       required:
 *         - email
 *         - displayName
 *         - password
 */
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
 *         password: 
 *           type: string
 *           description: 'User password.'
 *       required:
 *         - email
 *         - password
 */
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
 *       required:
 *         - displayName
 */
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
 *         newPassword: 
 *           type: string
 *           description: 'New user password.'
 *       required:
 *         - password
 *         - newPassword
 */
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
 *         avgActiveUserIn7Day: 
 *           type: number
 *           description: 'Average number of active session users in the last 7 days rolling.'
 *       required:
 *         - totalSignedUpUser
 *         - totalActiveUserToday
 *         - avgActiveUserIn7Day
 */
export type UserStatistics = {
    totalSignedUpUser: string,
    totalActiveUserToday: string,
    avgActiveUserIn7Day: number
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
 *         size: 
 *           type: number
 *           description: 'The item size per page.'
 *         orderBy:
 *           $ref : '#/components/schemas/OrderBy'
 *       required:
 *         - index
 *         - size
 */
export type UserInfoQuery = {
    index: number,
    size: number,
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
 *         size: 
 *           type: number
 *           description: 'Size of the page from the query.'
 *         total:
 *           type: number
 *           description: 'Total number of pages in the query.'
 *         totalItem:
 *           type: number
 *           description: 'Total number of items.'
 *         content:
 *           type: array
 *           description: 'Item instances in this page.'
 *           items:
 *             $ref : '#/components/schemas/UserInfo'
 *       required:
 *         - index
 *         - size
 *         - total
 *         - totalItem
 *         - content
 */
export type UserInfoPage = {
    index: number,
    size: number,
    total: number,
    totalItem: number
    content: UserInfo[]
}
