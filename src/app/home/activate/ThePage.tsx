'use client'

/*
 * @author: Dennis Chen
 */

import { Authentication, CommonResponse, Profile } from "@/app/api/v0/dto"
import { setSessionStoreItem } from "@/app/home/client-utils"
import homeStyles from "@/app/home/home.module.scss"
import { Button, FormHelperText, TextField } from '@mui/material'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import axios, { AxiosError } from "axios"
import clsx from 'clsx'
import { Validator } from "jsonschema"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import Cookies from 'universal-cookie'

const scheamValidator = new Validator()

//passed from server component
export type ThePageProps = {

}

export default function ThePage(props: ThePageProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [activationToken, setActivationToken] = useState('')
    const [activationTokenHelp, setActivationTokenHelp] = useState('')

    const [commonHelp, setCommonHelp] = useState('')
    const [activating, setActivating] = useState(false)

    const [authToken, setAuthToken] = useState('')
    const [profile, setProfile] = useState<Profile>()


    const onClickActivate = useCallback(() => {

        let invalid = false

        //token
        let v = scheamValidator.validate(activationToken, { minLength: 1 }, { required: true })
        if (!v.valid) {
            setActivationTokenHelp(v.errors.map((e) => e.message).join(', '))
            invalid = true
        } else {
            setActivationTokenHelp('')
        }

        setCommonHelp('')

        if (!invalid) {
            setActivating(true)

            axios.post(`/api/v0/pub/activate`, { token: activationToken }).then((res) => {

                const auth: Authentication = res.data

                setAuthToken(auth.authToken)
                setProfile(auth.profile)

                setSessionStoreItem('authToken', auth.authToken)
                setSessionStoreItem('profile', auth.profile)

                const cookies = new Cookies(null, { path: '/' })
                cookies.set('authToken', auth.authToken)

                // show message to user, route later
                setTimeout(() => {
                    router.push('/home/dashboard')
                }, 200)
            }).catch((err: AxiosError) => {
                const res: CommonResponse = err.response?.data as any
                if (res && res.message) {
                    setCommonHelp(res.message)
                } else if (err.message) {
                    setCommonHelp(err.message)
                } else {
                    setCommonHelp('Unknow server error')
                }
            }).finally(() => {
                setActivating(false)
            })

        }

    }, [activationToken])

    useEffect(() => {
        const activationToken = searchParams?.get('token')
        if (activationToken) {
            setActivationToken(activationToken)
        }
    }, [])


    return <main className={homeStyles.main}>
        <Paper elevation={1} className={homeStyles.mainPaper}>
            {authToken && <div className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32, width: 600 }}>
                <Typography variant='h6'>{profile?.displayName}, You are now logged in</Typography>
                <Link href='/home/dashboard'>Redirect to dashboard</Link>
            </div>}
            {!authToken && <form className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32, width: 600 }}
                onSubmit={(evt) => {
                    evt.preventDefault()
                    onClickActivate()
                }}>
                <Typography variant='h6' >Activate account</Typography>
                <TextField
                    required
                    label="Activation Token"
                    placeholder='Token in the activation mail'
                    InputLabelProps={{
                        shrink: true,
                    }}
                    className={clsx(homeStyles.fullwidth)}
                    value={activationToken}
                    onChange={(evt) => {
                        setActivationToken(evt.target.value)
                        setActivationTokenHelp('')
                    }}
                    error={!!activationTokenHelp}
                    helperText={activationTokenHelp}
                    disabled={activating}

                ></TextField>

                {commonHelp && <FormHelperText error={true}>
                    {commonHelp}
                </FormHelperText>}


                <div className={homeStyles.hlayout} style={{ padding: 8, justifyContent: 'center', gap: 24 }}>
                    <Button onClick={onClickActivate} disabled={activating} type="submit">Activate</Button>
                    <Button onClick={() => {
                        router.push('/home')
                    }} disabled={activating}>Home</Button>
                </div>
            </form>}
        </Paper>
    </main>
}