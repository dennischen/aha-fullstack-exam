'use client'

/*
 * @author: Dennis Chen
 */

import { cleanClientAuthentication, getCookieAuthToken } from "@/app/home/client-utils"
import homeStyles from "@/app/home/home.module.scss"
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useWorkspace } from "@nextspace"
import axios, { AxiosError } from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"


export type ThePageProps = {
}

export default function ThePage(props: ThePageProps) {
    const router = useRouter()
    const { envVariables } = useWorkspace()

    useEffect(() => {
        const authToken = getCookieAuthToken()
        if (authToken) {
            axios.get(`${envVariables.API_BASE_URL}/api/v0/pri/signout`, {
                headers: {
                    authToken: authToken
                }
            }).then((res) => {
                
                cleanClientAuthentication()

                //show message to user, route later
                setTimeout(() => {
                    //has to use refresh to clean route cache (for invalidate token)
                    router.refresh();
                    router.push('/home')
                }, 200)
            }).catch((err:AxiosError) => {
                //eat
            })
        }else{
            router.refresh();
            router.push('/home')
        }
    }, [envVariables, router])


    return <main className={homeStyles.main}>
        <Paper elevation={1} className={homeStyles.mainPaper}>
            {<div className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32, width: 800 }}>
                <Typography variant='h6'>Signing out</Typography>
                <Link href='/home'>Home</Link>
            </div>}
        </Paper>
    </main>
}