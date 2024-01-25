
/*
 * @author: Dennis Chen
 */

import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { createSwaggerSpec } from 'next-swagger-doc'
import { swaggerOptions } from './api/spec.json'

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

//use dynamic() to fix 
//This might be caused by a React Class Component being rendered in a Server Component, 
//React Class Components only works in Client Components
const SwaggerUI = dynamic<{ spec?: any }>(() => import('swagger-ui-react'), { ssr: false })

export default function ApiUi({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
    return <SwaggerUI spec={spec} />
}

export const getStaticProps: GetStaticProps = async () => {
    const spec: Record<string, any> = createSwaggerSpec(swaggerOptions)
    return {
        props: {
            spec,
        },
    }
}