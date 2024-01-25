'use client'

/*
 * @author: Dennis Chen
 */

import { CommonResponse, SignupForm, SignupFormSchema, passwordPattern, passwordPatternMsg } from "@/app/api/v0/dto"
import { getErrorCommonHelp } from "@/app/home/client-utils"
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
import { useCallback, useState } from "react"

const scheamValidator = new Validator()

export type ThePageProps = {}

export default function ThePage({ }: ThePageProps) {
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [emailHelp, setEmailHelp] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [displayNameHelp, setDisplayNameHelp] = useState('')
    const [password, setPassword] = useState('')
    const [passwordHelp, setPasswordHelp] = useState('')
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [passwordVerify, setPsswordVerify] = useState('')
    const [passwordVerifyHelp, setPasswordVerifyHelp] = useState('')
    const [passwordVerifyVisible, setPasswordVerifyVisible] = useState(false)

    const [commonHelp, setCommonHelp] = useState<CommonHelp>()
    const [registering, setRegistering] = useState(false)

    const [signupCompleted, setSignupCompleted] = useState<CommonResponse>()

    const onClickRegister = useCallback(() => {

        let invalid = false

        //email
        let v = scheamValidator.validate(email, SignupFormSchema.properties!.email, { required: true })
        if (!v.valid) {
            setEmailHelp(v.errors.map((e) => e.message).join(', '))
            invalid = true
        } else {
            setEmailHelp('')
        }

        //displayname
        const dn = displayName.trim()
        v = scheamValidator.validate(dn, SignupFormSchema.properties!.displayName, { required: true })
        if (!v.valid) {
            setDisplayNameHelp(v.errors.map((e) => e.message).join(', '))
            invalid = true
        } else {
            setDisplayNameHelp('')
        }

        //password
        v = scheamValidator.validate(password, SignupFormSchema.properties!.password, { required: true })
        if (!v.valid) {
            setPasswordHelp(v.errors.map((e) => e.message).join(', '))
            invalid = true
        } else {
            if (!passwordPattern.test(password)) {
                setPasswordHelp(passwordPatternMsg)
                invalid = true
            } else {
                setPasswordHelp('')
            }
        }

        //password verify
        if ((passwordVerify !== password)) {
            setPasswordVerifyHelp("doen't not match the password")
            invalid = true
        } else {
            setPasswordVerifyHelp('')
        }


        setCommonHelp(undefined)

        if (!invalid) {
            setRegistering(true)

            const data: SignupForm = {
                email,
                displayName,
                password
            }

            axios.post(`/api/v0/pub/signup`, data).then((res) => {
                setSignupCompleted(res.data as CommonResponse)
            }).catch((err: AxiosError) => {
                setCommonHelp(getErrorCommonHelp(err))
            }).finally(() => {
                setRegistering(false)
            })

        }

    }, [email, displayName, password, passwordVerify])

    return <main className={homeStyles.main}>
        <Paper elevation={1} className={homeStyles.mainPaper}>
            {signupCompleted && <div className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32, width: 800 }}>
                <Typography variant='h6' >Congratulations! You are Now Signed Up!</Typography>
                <Typography >Please check your email for activation</Typography>
                <FormHelperText>
                    {signupCompleted.message}
                </FormHelperText>
                <div className={homeStyles.hlayout} style={{ padding: 8, justifyContent: 'center', gap: 24 }}>
                    <Button onClick={() => {
                        router.push('/home')
                    }} disabled={registering}>Home</Button>
                </div>
            </div>}
            {!signupCompleted && <form className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32, width: 800 }}
                onSubmit={(evt) => {
                    evt.preventDefault()
                    onClickRegister()
                }}>
                <Typography variant='h6' >Signup to application</Typography>
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
                    disabled={registering}

                ></TextField>
                <TextField
                    required
                    label="Display Name"
                    placeholder='Foo Bar'
                    InputLabelProps={{
                        shrink: true,
                    }}
                    className={clsx(homeStyles.fullwidth)}
                    value={displayName}
                    onChange={(evt) => {
                        setDisplayName(evt.target.value)
                        setDisplayNameHelp('')
                    }}
                    error={!!displayNameHelp}
                    helperText={displayNameHelp}
                    disabled={registering}
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
                    disabled={registering}
                ></TextField>
                <TextField
                    required
                    label="Password Verfication"
                    placeholder='P@ssw0rd'
                    InputLabelProps={{
                        shrink: true,
                    }}
                    type={passwordVerifyVisible ? "text" : "password"}
                    InputProps={{
                        endAdornment: <VisibilityAdornment visible={passwordVerifyVisible}
                            onClick={() => { setPasswordVerifyVisible(!passwordVerifyVisible) }}
                        />
                    }}
                    className={clsx(homeStyles.fullwidth)}
                    value={passwordVerify}
                    onChange={(evt) => {
                        setPsswordVerify(evt.target.value)
                        setPasswordVerifyHelp('')
                    }}
                    error={!!passwordVerifyHelp}
                    helperText={passwordVerifyHelp}
                    disabled={registering}
                ></TextField>

                {commonHelp && <FormHelperText error={commonHelp.error}>
                    {commonHelp.message}
                </FormHelperText>}


                <div className={clsx(homeStyles.hlayout, homeStyles.fullwidth)} style={{ padding: 8, justifyContent: 'end', gap: 24 }}>
                    <Button onClick={onClickRegister} variant="contained" disabled={registering} type="submit">Register</Button>
                </div>
            </form>}
        </Paper>
        <div className={homeStyles.hlayout} style={{ padding: 8, justifyContent: 'center', gap: 24 }}>
            <Link href='/home'>Home</Link>
        </div>
    </main>
}