'use client'

/*
 * @author: Dennis Chen
 */

import { getSessionStoreItem, removeSessionStoreItem } from "@/app/home/client-utils"
import homeStyles from "@/app/home/home.module.scss"
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import axios, { AxiosError } from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Cookies from 'universal-cookie'


export type ThePageProps = {
}

export default function ThePage(props: ThePageProps) {
    const router = useRouter()

    useEffect(() => {
        const authToken = getSessionStoreItem('authToken')
        if (authToken) {
            axios.get(`/api/v0/pri/signout`, {
                headers: {
                    authToken: authToken
                }
            }).then((res) => {
                console.log(">>>>>", res)

                removeSessionStoreItem('authToken')
                removeSessionStoreItem('profile')
                const cookies = new Cookies(null, { path: '/' })
                cookies.remove('authToken', { path: '/' })

                //show message to user, route later
                setTimeout(() => {
                    //has to use refresh to clean route cache (for invalidate token)
                    router.refresh();
                    router.push('/home')
                }, 100)
            }).catch((err:AxiosError) => {
                //eat
            })
        }else{
            router.refresh();
            router.push('/home')
        }
    }, [])


    return <main className={homeStyles.main}>
        <Paper elevation={1} className={homeStyles.mainPaper}>
            {<div className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32, width: 600 }}>
                <Typography variant='h6'>Signing out</Typography>
                <Link href='/home'>Home</Link>
            </div>}
        </Paper>
    </main>
}