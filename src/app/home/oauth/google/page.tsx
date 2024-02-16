
/*
 * 
 * @author: Dennis Chen
 */

import { Authentication } from "@/app/api/v0/dto"
import homeStyles from "@/app/home/home.module.scss"
import { findAuthTokenInCookie } from "@/app/home/server-utils"
import Typography from "@mui/material/Typography"
import axios from "axios"
import { google } from "googleapis"
import Link from "next/link"
import { redirect } from "next/navigation"
import ThePage from "./ThePage"

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET
const REDIRECT_URI = process.env.WEB_BASE_URL + '/home/oauth/google'

const SCOPES = ['https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile']

export default async function page({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined }
}) {

    const authToken = findAuthTokenInCookie()

    if (authToken) {
        //there is a authToken, I assumpt user has loged in, so redirect to dashboard.
        //in dashboard(and other auth-required page), it will check if authToken is still available by use effect
        redirect('/home/dashboard')
    } else {

        //google oauth redirect back
        //http://127.0.0.1:3000/home/oauth/google?code=....&scope=....&authuser=0&prompt=consent
        if (searchParams && searchParams.code && searchParams.scope) {
            try {
                const res = await axios.get(`${process.env.API_BASE_URL}/api/v0/oauth/google`, {
                    params: {
                        code: searchParams.code
                    }
                })

                //can't set cookie direct in asyn server component, use client component to set and redirect
                const authentication: Authentication = res.data
                return <ThePage authToken={authentication.authToken} profile={authentication.profile} />
            } catch (err: any) {
                console.error("Google Oauth API error", err)
                return <div className={homeStyles.vlayout} style={{ padding: 16, gap: 16 }}>
                    <Typography>{err.response?.data?.message || err.response?.statusText || err}</Typography>
                    <div className={homeStyles.hlayout} style={{ padding: 16, gap: 32 }}>
                        <Link href={'/home/oauth/google'}>Try again</Link>
                        <Link href={'/home'}>Home</Link>
                    </div>
                </div>
            }
        } else {
            const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
            })
            redirect(authUrl)
        }
    }
}