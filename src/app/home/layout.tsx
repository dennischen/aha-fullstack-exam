
/*
 * @author: Dennis Chen
 */

/*
 * Server Component layout for getting information from cookie
 * 
 * @author: Dennis Chen
 */

import { Metadata } from 'next'
import TheLayout from "./TheLayout"

import { getUserPreference } from './server-utils'

//force no-static page (use cookies() did the same thing in nextjs)
export const dynamic = 'force-dynamic' // always use dyanmic

export const metadata: Metadata = {
    title: process.env.APP_NAME,
    viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
}

export type LayoutProps = {
    children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
    
    const preference = getUserPreference()

    const envVariables: {
        [key: string]: string | undefined
    } = {}
    for (var p in process.env) {
        if (p.startsWith('CLIENT_PUBLIC_')) {
            envVariables[p] = process.env[p]
        }
    }

    return <TheLayout defaultLanguage={preference.userLanguage} envVariables={envVariables}>
        {children}
    </TheLayout>
}
