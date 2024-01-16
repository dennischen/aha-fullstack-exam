/*
 * Server Component layout for getting information from cookie
 * @file-created: 2023-10-23
 * @author: Dennis Chen
 */

import { Metadata } from 'next'
import TheLayout from "./TheLayout"

import { getUserPreference } from './server-utils'

//force no-static page (use cookies() did the same thing in nextjs)
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Aha Fullstack Exam',
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
        if (p.startsWith('EXAM_PUBLIC_')) {
            envVariables[p] = process.env[p]
        }
    }

    return <TheLayout defaultLanguage={preference.userLanguage} envVariables={envVariables}>
        {children}
    </TheLayout>
}
