'use client'
/* a layout client component to prevent build loader resource into laout.js
 * @file-created: 2023-10-23
 * @author: Dennis Chen
 */
import WorkspaceBoundary from '@nextspace/WorkspaceBoundary'
import Modal from '@nextspace/components/Modal'
import { WorkspaceConfig } from '@nextspace/types'
import I18nextTranslationHolder from '@nextspace/utils/I18nextTranslationHolder'
import { Suspense, useMemo } from 'react'
import examStyles from "./exam.module.scss"

import translationLoader from '@nextspace/components/translationLoader'
import NProgressIndicator from '@nextspace/utils/NProgressIndicator'
import i18next from 'i18next'

import nProgress from 'nprogress'
import 'nprogress/nprogress.css'

import clsx from 'clsx'
import "./global.scss"

import { useI18n } from '@nextspace'

//the default translation
import fallbackTranslation from "./i18n/en.json"
const fallbackLanguage = "en"

const EnTranslationLoader = translationLoader("en", () => import('./i18n/enTranslationRegister'))
const ZhTranslationLoader = translationLoader("zh", () => import('./i18n/zhTranslationRegister'))
const translationLoaders = [EnTranslationLoader, ZhTranslationLoader]

export type TheLayoutProps = {
    defaultLanguage?: string,
    envVariables?: { [key: string]: string | undefined }
    children: React.ReactNode
}

export default function TheLayout({ defaultLanguage, envVariables, children }: TheLayoutProps) {

    defaultLanguage = translationLoaders.find((l) => l.language === defaultLanguage)?.language || translationLoaders[0].language

    const config = useMemo(() => {
        return {
            translationHolder: new I18nextTranslationHolder(i18next.createInstance(), {
                fallbackLng: fallbackLanguage,
                fallbackTranslation: fallbackTranslation
            }),
            progressIndicator: new NProgressIndicator(nProgress)
        } as WorkspaceConfig
    }, [])

    return <WorkspaceBoundary
        defaultLanguage={defaultLanguage} translationLoaders={translationLoaders}
        envVariables={envVariables} config={config} >
        <Layout>
            {children}
            <div className={examStyles.flexpadding} />
        </Layout>
    </WorkspaceBoundary >

}

// a internal component to using theme and modal fallback in WorkspaceBoundary
function Layout({ children }: { children: React.ReactNode }) {
    const i18n = useI18n()
    return <Suspense fallback={<Modal>{i18n.l("loading")}...</Modal>}>
        <div className={clsx(examStyles.layout)}>{children}</div>
    </Suspense >

}