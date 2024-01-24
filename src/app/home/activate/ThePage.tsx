'use client'

/*
 * @author: Dennis Chen
 */

import { ActivationForm, Authentication, Profile } from "@/app/api/v0/dto"
import { getErrorCommonHelp, setClientAuthentication } from "@/app/home/client-utils"
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
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const scheamValidator = new Validator()

//passed from server component
export type ThePageProps = {

}

export default function ThePage(props: ThePageProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [activationToken, setActivationToken] = useState('')
    const [activationTokenHelp, setActivationTokenHelp] = useState('')

    const [commonHelp, setCommonHelp] = useState<CommonHelp>()
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

        setCommonHelp(undefined)

        if (!invalid) {
            setActivating(true)

            const data: ActivationForm = { token: activationToken }

            axios.post(`/api/v0/pub/activate`, data).then((res) => {

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
                setActivating(false)
            })

        }

    }, [router, activationToken])

    useEffect(() => {
        const activationToken = searchParams?.get('token')
        if (activationToken) {
            setActivationToken(activationToken)
        }
    }, [searchParams])


    return <main className={homeStyles.main}>
        <Paper elevation={1} className={homeStyles.mainPaper}>
            {authToken && <div className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32, width: 800 }}>
                <Typography variant='h6'>{profile?.displayName}, You are now logged in</Typography>
                <Link href='/home/dashboard'>Redirect to dashboard</Link>
            </div>}
            {!authToken && <form className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32, width: 800 }}
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

                {commonHelp && <FormHelperText error={commonHelp.error}>
                    {commonHelp.message}
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