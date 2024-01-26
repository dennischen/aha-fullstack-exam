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
        <div className={homeStyles.vlayout} style={{ justifyContent: 'center', padding: 16, gap: 32}}>
            <Typography variant='h6' >Welcome to {l('appName')}</Typography>
            <div>
                <Image src='/images/colaorange.png' alt='' width={300} height={300}/>
            </div>
        </div>
        <div className={clsx(homeStyles.hlayout, homeStyles.fullwidth)} style={{ padding: 16, justifyContent: 'center', gap: 48 }}>
            <Link href={'/home/signup'} >Signup</Link>
            <Link href={'/home/signin'} >Signin</Link>
        </div>
    </main>
}