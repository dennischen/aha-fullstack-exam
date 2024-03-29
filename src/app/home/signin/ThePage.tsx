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
import { useWorkspace } from "@nextspace"
import axios, { AxiosError } from "axios"
import clsx from 'clsx'
import { Validator } from "jsonschema"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"

const scheamValidator = new Validator()

//passed from server component
export type ThePageProps = {
    authToken?: string
    profile?: Profile
}

export default function ThePage(props: ThePageProps) {

    const { envVariables } = useWorkspace()
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [emailHelp, setEmailHelp] = useState('')
    const [password, setPassword] = useState('')
    const [passwordHelp, setPasswordHelp] = useState('')
    const [passwordVisible, setPasswordVisible] = useState(false)

    const [commonHelp, setCommonHelp] = useState<CommonHelp>()
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

        setCommonHelp(undefined)

        if (!invalid) {
            setSigning(true)

            const data: SigninForm = {
                email,
                password
            }
            
            axios.post(`${envVariables.API_BASE_URL}/api/v0/pub/signin`, data).then((res) => {

                const auth: Authentication = res.data

                setAuthToken(auth.authToken)
                setProfile(auth.profile)

                setClientAuthentication(auth)

                // show message to user, route later
                setTimeout(() => {
                    //has to use refresh to clean route cache (for invalidate token)
                    router.refresh()
                    router.push('/home/dashboard')
                }, 200)
            }).catch((err: AxiosError) => {
                setCommonHelp(getErrorCommonHelp(err))
            }).finally(() => {
                setSigning(false)
            })

        }

    }, [envVariables, router, email, password])



    return <main className={homeStyles.main}>
        <Paper elevation={1} className={homeStyles.mainPaper}>
            {authToken && <div className={homeStyles.vlayout} style={{ justifyContent: 'center', gap: 32}}>
                <Typography variant='h6'>{profile?.displayName}, You are now logged in</Typography>
                <Link href='/home/dashboard'>Redirect to dashboard</Link>
            </div>}
            {!authToken && <form className={homeStyles.vlayout} style={{ justifyContent: 'center', gap: 32}}
                onSubmit={(evt) => {
                    evt.preventDefault()
                    onClickSignin()
                }}>
                <Typography variant='h6' >Signin to application</Typography>
                <TextField
                    required
                    label="Email"
                    placeholder='foo@bar.net'
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
                    placeholder='P@ssw0rd'
                    InputLabelProps={{
                        shrink: true,
                    }}
                    type={passwordVisible ? "text" : "password"}
                    InputProps={{
                        endAdornment: <VisibilityAdornment visible={passwordVisible}
                            onClick={() => { setPasswordVisible(!passwordVisible) }}
                        />
                    }}
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

                {commonHelp && <FormHelperText error={commonHelp.error}>
                    {commonHelp.message}
                </FormHelperText>}


                <div className={clsx(homeStyles.hlayout, homeStyles.fullwidth)} style={{ padding: 8, justifyContent: 'end', gap: 24 }}>
                    <Link href='/home/oauth/google'>Sing in with Google</Link>
                    <Button onClick={onClickSignin} variant="contained" disabled={signing} type="submit">Signin</Button>
                </div>
            </form>}
        </Paper>
        {!authToken && <div className={homeStyles.hlayout} style={{ padding: 8, justifyContent: 'center', gap: 24 }}>
            <Link href='/home'>Home</Link>
        </div>}
    </main>
}