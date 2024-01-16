
import acceptLanguageParser from 'accept-language-parser'
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