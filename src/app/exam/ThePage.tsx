'use client'

/*
 * @file-created: 2023-10-23
 * @author: Dennis Chen
 */

import { useI18n, useWorkspace } from "@nextspace"
import examStyles from "./exam.module.scss"


export type ThePageProps = {}

export default function ThePage({ }: ThePageProps) {
    const workspace = useWorkspace()
    const {l, language} = useI18n()

    return <main className={examStyles.main}>
        <div className={examStyles.homegrid}>
        {language}/{l('appName')}
        </div>
    </main>
}