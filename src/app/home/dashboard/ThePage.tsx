'use client'

/*
 * 
 * @author: Dennis Chen
 */

import homeStyles from '@/app/home/home.module.scss'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useI18n, useWorkspace } from "@nextspace"
import Link from 'next/link'

export type ThePageProps = {}

export default function ThePage({ }: ThePageProps) {

    const workspace = useWorkspace()
    const { l, language } = useI18n()

    return <main className={homeStyles.main}>
        <Paper elevation={1} className={homeStyles.mainPaper}>
            <div className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 16 }}>
                <Typography variant='h6' >Dashboard</Typography>


                <div className={homeStyles.hlayout} style={{ padding: 8, justifyContent: 'center', gap: 24 }}>
                    <Link href='/home/signout'>Signout</Link>
                </div>
            </div>
         </Paper>
    </main>
}