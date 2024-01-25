'use client'

/*
 * 
 * @author: Dennis Chen
 */

import Typography from '@mui/material/Typography'
import { useI18n, useWorkspace } from "@nextspace"
import clsx from "clsx"
import Image from "next/image"
import Link from 'next/link'
import homeStyles from "./home.module.scss"

export type ThePageProps = {}

export default function ThePage({ }: ThePageProps) {
    const workspace = useWorkspace()
    const { l, language } = useI18n()

    return <main className={homeStyles.main}>
        <div className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32, width: 800 }}>
            <Typography variant='h6' >Welcome to {l('appName')}</Typography>
            <div style={{ height: 180 }}>
                <Image src='/vercel.svg' alt='' width={394} height={180}/>
            </div>
        </div>
        <div className={clsx(homeStyles.hlayout, homeStyles.fullwidth)} style={{ padding: 8, justifyContent: 'center', gap: 48 }}>
            <Link href={'/home/signup'} >Signup</Link>
            <Link href={'/home/signin'} >Signin</Link>
        </div>
    </main>
}