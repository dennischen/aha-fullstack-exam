import { withSwagger } from 'next-swagger-doc'
import { Options, OAS3Definition } from 'swagger-jsdoc'

export type SwaggerOptions = Options & {
    apiFolder?: string
    schemaFolders?: string[]
    definition: OAS3Definition
    outputFile?: string
}

export const swaggerOptions: SwaggerOptions = {
    //https://editor.swagger.io/
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Aha Fullstack Exam API',
            version: '0.1.0',
            description: 'The OpenAPI document and test site for Aha Fullstack Exam'
        },
        tags: [{
            name: 'pub',
            description: 'public api for unathenticated user'
        }, {
            name: 'pri',
            description: 'api for athenticated user'
        }, {
            name: 'adm',
            description: 'adm api for athenticated administrator'
        }, {
            name: 'test',
            description: 'api for test'
        }],
        components: {
            securitySchemes: {
                authToken: {
                    in: 'header',
                    name: 'authToken',
                    type: 'apiKey'
                }
            }
        }
    },
    apiFolder: 'src/app/api',
    schemaFolders: ['src/app/api']
}

const swaggerHandler = withSwagger(swaggerOptions)
export default swaggerHandler()