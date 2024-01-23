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
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import Cookies from 'universal-cookie';

const scheamValidator = new Validator()

//passed from server component
export type ThePageProps = {
    authToken?: string
    profile?: Profile
}

export default function ThePage(props: ThePageProps) {

    const router = useRouter()

    const [email, setEmail] = useState('')
    const [emailHelp, setEmailHelp] = useState('')
    const [password, setPassword] = useState('')
    const [passwordHelp, setPasswordHelp] = useState('')

    const [commonHelp, setCommonHelp] = useState('')
    const [signing, setSigning] = useState(false)

    const [authToken, setAuthToken] = useState(props.authToken)
    const [profile, setProfile] = useState(props.profile)

    const onClickSignin = useCallback(() => {

        let invalid = false

        //email
        let v = scheamValidator.validate(email, { minLength: 1 }, { required: true })
        if (!v.valid) {
            setEmailHelp(v.errors.map((e) => e.message).join(', '))
            invalid = true
        } else {
            setEmailHelp('')
        }

        //password
        v = scheamValidator.validate(password, { minLength: 1 }, { required: true })
        if (!v.valid) {
            setPasswordHelp(v.errors.map((e) => e.message).join(', '))
            invalid = true
        } else {
            setPasswordHelp('')
        }

        setCommonHelp('')

        if (!invalid) {
            setSigning(true)

            axios.post(`/api/v0/pub/signin`, { email, password }).then((res) => {

                const auth: Authentication = res.data

                setAuthToken(auth.authToken)
                setProfile(auth.profile)

                setSessionStoreItem('authToken', auth.authToken)
                setSessionStoreItem('profile', auth.profile)
                
                const cookies = new Cookies(null, { path: '/' });
                cookies.set('authToken', auth.authToken)
                
                // show message to user, route later
                setTimeout(()=>{
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
                setSigning(false)
            })

        }

    }, [email, password])



    return <main className={homeStyles.main}>
        <Paper elevation={1} className={homeStyles.mainPaper}>
            {authToken && <div className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32, width: 600 }}>
                <Typography variant='h6'>{profile?.displayName}, You are now logged in</Typography>
                <Link href='/home/dashboard'>Redirect to dashboard</Link>
            </div>}
            {!authToken && <form className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32, width: 600 }}
                onSubmit={(evt) => {
                    evt.preventDefault()
                    onClickSignin()
                }}>
                <Typography variant='h6' >Signin to application</Typography>
                <TextField
                    required
                    label="Email"
                    placeholder='foo@bar.com'
                    InputLabelProps={{
                        shrink: true,
                    }}
                    className={clsx(homeStyles.fullwidth)}
                    value={email}
                    onChange={(evt) => {
                        setEmail(evt.target.value)
                        setEmailHelp('')
                    }}
                    error={!!emailHelp}
                    helperText={emailHelp}
                    disabled={signing}

                ></TextField>
                <TextField
                    required
                    label="Password"
                    placeholder='P@sSw0rD'
                    InputLabelProps={{
                        shrink: true,
                    }}
                    type="password"
                    className={clsx(homeStyles.fullwidth)}
                    value={password}
                    onChange={(evt) => {
                        setPassword(evt.target.value)
                        setPasswordHelp('')
                    }}
                    error={!!passwordHelp}
                    helperText={passwordHelp}
                    disabled={signing}
                ></TextField>

                {commonHelp && <FormHelperText error={true}>
                    {commonHelp}
                </FormHelperText>}


                <div className={homeStyles.hlayout} style={{ padding: 8, justifyContent: 'center', gap: 24 }}>
                    <Button onClick={onClickSignin} disabled={signing} type="submit">Signin</Button>
                    <Button onClick={() => {
                        router.push('/home')
                    }} disabled={signing}>Home</Button>
                </div>
            </form>}
        </Paper>
    </main>
}