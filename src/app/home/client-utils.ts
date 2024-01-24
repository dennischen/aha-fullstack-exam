import { Authentication, CommonResponse } from "@/app/api/v0/dto"
import Cookies from "universal-cookie"
import { CommonHelp } from "./types"
import moment from "moment"

const cookies = new Cookies(null, { path: '/' })

export function getSessionStoreItem(key: string): string | undefined {
    return sessionStorage.getItem(key) || undefined

}
export function getSessionStoreObject<T>(key: string): T | undefined {
    const val = sessionStorage.getItem(key)
    try {
        return val ? JSON.parse(val) : undefined
    } catch (err) {
        //just in case someone modify it locally
        console.error(err)
        return undefined
    }
}

export function setSessionStoreItem<T>(key: string, value: any) {
    if (!value) {
        removeSessionStoreItem(key)
        return
    }
    if (typeof value === 'string') {
        sessionStorage.setItem(key, value)
    } else {
        sessionStorage.setItem(key, JSON.stringify(value))
    }
}

export function removeSessionStoreItem(key: string) {
    sessionStorage.removeItem(key)
}

export function getCookieAuthToken(): string | undefined{
    return cookies.get('authToken')
}

export function setClientAuthentication(authentication: Authentication) {
    setSessionStoreItem('profile', authentication.profile)
    cookies.set('authToken', authentication.authToken, { path: '/', maxAge: moment.duration(7, 'days').asSeconds()})
}

export function cleanClientAuthentication() {
    removeSessionStoreItem('profile')
    cookies.remove('authToken', { path: '/' })
}


export function getErrorCommonHelp(err: any): CommonHelp {
    const cr: CommonResponse = err?.response?.data as any
    if (cr && cr.message) {
        return { error: true, message: cr.message }
    } else if (err.message) {
        return { error: true, message: err.message }
    } else {
        return { error: true, message: 'Unknow error' }
    }
}