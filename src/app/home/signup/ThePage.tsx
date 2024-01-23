'use client'

/*
 * @author: Dennis Chen
 */

import { CommonResponse, SignupFormSchema, passwordPattern, passwordPatternMsg } from "@/app/api/v0/dto"
import homeStyles from "@/app/home/home.module.scss"
import { Button, FormHelperText, TextField } from '@mui/material'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import clsx from 'clsx'
import { Validator } from "jsonschema"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import axios, { AxiosError } from "axios"

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
    const [passwordVerify, setPsswordVerify] = useState('')
    const [passwordVerifyHelp, setPasswordVerifyHelp] = useState('')

    const [commonHelp, setCommonHelp] = useState('')
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


        setCommonHelp('')

        if (!invalid) {
            setRegistering(true)

            axios.post(`/api/v0/pub/signup`, { email, displayName, password }).then((res) => {
                setSignupCompleted(res.data as CommonResponse)
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
                setRegistering(false)
            })

        }

    }, [email, displayName, password, passwordVerify])

    return <main className={homeStyles.main}>
        <Paper elevation={1} className={homeStyles.mainPaper}>
            {signupCompleted && <div className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32, width: 600 }}>
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
            {!signupCompleted && <form className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32, width: 600 }}
                onSubmit={(evt)=>{
                    evt.preventDefault()
                    onClickRegister()
                }}>
                <Typography variant='h6' >Signup to application</Typography>
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
                    disabled={registering}
                ></TextField>
                <TextField
                    required
                    label="Password Verfication"
                    placeholder='P@sSw0rD'
                    InputLabelProps={{
                        shrink: true,
                    }}
                    type="password"
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

                {commonHelp && <FormHelperText error={true}>
                    {commonHelp}
                </FormHelperText>}


                <div className={homeStyles.hlayout} style={{ padding: 8, justifyContent: 'center', gap: 24 }}>
                    <Button onClick={onClickRegister} disabled={registering} type="submit">Register</Button>
                    <Button onClick={() => {
                        router.push('/home')
                    }} disabled={registering}>Home</Button>
                </div>
            </form>}
        </Paper>
    </main>
}