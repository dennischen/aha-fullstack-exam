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
            name: 'auth',
            description: 'authenitcation related api'
        }, {
            name: 'signin',
            description: 'signin related api'
        }, {
            name: 'signup',
            description: 'signup related api'
        }, {
            name: 'user',
            description: 'user related api'
        }, {
            name: 'statastics',
            description: 'statastics related api'
        }],
        components: {
            securitySchemes: {
                "authToken": {
                    in: 'header',
                    name: 'authToken',
                    type: 'apiKey'
                }
            },
            schemas: {
                IdObject: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'abcdefg'
                        }
                    },
                    required: ['id']
                }
            }
        }
    },
    apiFolder: 'src/app/api',
}

const swaggerHandler = withSwagger(swaggerOptions)
export default swaggerHandler()