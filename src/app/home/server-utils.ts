
/*
 * @author: Dennis Chen
 */

import { Authentication, Profile } from '@/app/api/v0/dto'
import acceptLanguageParser from 'accept-language-parser'
import axios from 'axios'
import { cookies, headers } from 'next/headers'
import 'server-only'
import { COOKIE_LANGUAGE, DEFAULT_LANGUAGE, } from './constants'

export function getUserPreference() {

    const theCookies = cookies()
    const theHeaders = headers()

    const cookieLanguage = theCookies.get(COOKIE_LANGUAGE)?.value || ''

    const acceptLanguage = acceptLanguageParser.pick(['zh', 'en'], theHeaders.get('Accept-Language') || '')
    const userLanguage = cookieLanguage || acceptLanguage || DEFAULT_LANGUAGE

    return {
        userLanguage,
    }
}

export function findAuthTokenInCookie(): string | undefined {
    return cookies().get('authToken')?.value

}

export async function findAuthenticationInCookie(): Promise<Authentication | undefined> {
    const authToken = findAuthTokenInCookie()
    let profile: Profile | undefined
    if (authToken) {
        try {
            const res = await axios.get(`${process.env.API_BASE_URL}/api/v0/pri/profile`, {
                headers: {
                    authToken: authToken
                }
            })
            profile = res.data
            return {
                authToken: authToken,
                profile: profile!
            }
        } catch (err) {
            console.error('Error when get profile in server', err)
        }
    }
}