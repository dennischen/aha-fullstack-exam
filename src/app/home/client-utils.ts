

export function getSessionStoreItem(key: string): string | undefined {
    return sessionStorage.getItem(key) || undefined

}
export function getSessionStoreObject<T>(key: string): T | undefined {
    const val = sessionStorage.getItem(key)
    return val ? JSON.parse(key) : undefined
}

export function setSessionStoreItem<T>(key: string, value: any) {
    if(!value){
        removeSessionStoreItem(key)
        return;
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