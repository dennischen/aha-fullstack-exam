'use client'

/*
 * @author: Dennis Chen
 */

import { Profile } from "@/app/api/v0/dto"
import { setClientAuthentication } from "@/app/home/client-utils"
import homeStyles from "@/app/home/home.module.scss"
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

//passed from server component
export type ThePageProps = {
    authToken?: string
    profile?: Profile
}

export default function ThePage(props: ThePageProps) {

    const router = useRouter()

    const { authToken, profile } = props

    useEffect(() => {
        if (authToken && profile) {
            setClientAuthentication({ authToken, profile })
            setTimeout(() => {
                router.refresh()
                router.replace('/home/dashboard')
            }, 200)
        }
    }, [router, authToken, profile])

    return <main className={homeStyles.main}>
        <Paper elevation={1} className={homeStyles.mainPaper}>
            {authToken && <div className={homeStyles.vlayout} style={{ justifyContent: 'center', gap: 32}}>
                <Typography variant='h6'>{profile?.displayName}, You are now logged in</Typography>
                <Link href='/home/dashboard'>Redirect to dashboard</Link>
            </div>}
        </Paper>
    </main>
}