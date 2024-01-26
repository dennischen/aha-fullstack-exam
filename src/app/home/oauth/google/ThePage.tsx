'use client'

/*
 * @author: Dennis Chen
 */

import { Authentication, Profile, SigninForm } from "@/app/api/v0/dto"
import { getErrorCommonHelp, setClientAuthentication } from "@/app/home/client-utils"
import VisibilityAdornment from "@/app/home/components/VisibilityInputAdornment"
import homeStyles from "@/app/home/home.module.scss"
import { CommonHelp } from "@/app/home/types"
import Button from '@mui/material/Button'
import FormHelperText from '@mui/material/FormHelperText'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import axios, { AxiosError } from "axios"
import clsx from 'clsx'
import { Validator } from "jsonschema"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

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