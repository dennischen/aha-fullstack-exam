
/*
 * https://nextjs.org/docs/app/building-your-application/routing/internationalization
 * nextjs officially use async server page and async dictionaries to provider server i18n
 * 
 * @author: Dennis Chen
 */

import { loadTranslation, setTranslationLoaders } from '@nextspace/server/serverI18n'
import { ServerI18n } from '@nextspace/types'
import I18nextServerI18n from '@nextspace/utils/I18nextServerI18n'
import i18next from 'i18next'
import 'server-only'

// const translations = {
//     en: () => import('./en.json').then((module) => module.default),
//     zh: () => import('./zh.json').then((module) => module.default),
// }

// export default async function getTranslation(language: string) {
//     const fn = (translations as any)[language]
//     const translation = await (fn ?? translations.en)()
//     return {
//         language: fn ? language : 'en',
//         translation
//     }
// }

// import fallbackTranslation from "./en.json"
// const fallbackLanguage = "en"

setTranslationLoaders({
    en: () => import('./en.json'),
    zh: () => import('./zh.json'),
})

export async function getI18n(language: string): Promise<ServerI18n> {
    const translation = await loadTranslation(language)
    return new I18nextServerI18n(i18next.createInstance(), translation, {
        // fallbackLng: fallbackLanguage,
        // fallbackTranslation: fallbackTranslation
    })
}

