'use client'

/*
 * @author: Dennis Chen
 */

import { CommonResponse, Profile } from '@/app/api/v0/dto'
import { getErrorCommonHelp } from '@/app/home/client-utils'
import homeStyles from "@/app/home/home.module.scss"
import { CommonHelp } from "@/app/home/types"
import Button from '@mui/material/Button'
import FormHelperText from '@mui/material/FormHelperText'
import Typography from '@mui/material/Typography'
import { useWorkspace } from '@nextspace'
import axios, { AxiosError } from 'axios'
import clsx from 'clsx'
import { useCallback, useState } from 'react'

type Props = {
    authToken: string,
    profile: Profile,
    onUnauthenticated: () => void
}

export default function SendActivation({ authToken, profile, onUnauthenticated }: Props) {

    const { envVariables } = useWorkspace()
    const [commonHelp, setCommonHelp] = useState<CommonHelp>()
    const [updating, setUpdating] = useState(false)

    const onClickSend = useCallback(() => {

        setUpdating(true)

        axios.get(`${envVariables.API_BASE_URL}/api/v0/pri/send-activation`, {
            headers: {
                authToken
            }
        }).then((res) => {
            const cr: CommonResponse = res.data
            setCommonHelp(cr)
        }).catch((err: AxiosError) => {
            if (err.request.status === 401) {
                onUnauthenticated()
            } else {
                setCommonHelp(getErrorCommonHelp(err))
            }
        }).finally(() => {
            setUpdating(false)
        })

    }, [envVariables, authToken, onUnauthenticated])

    return <div className={homeStyles.vlayout}>
        <Typography>The account associated with {profile.displayName} has not been activated yet. Kindly activate it first by clicking the button below to resend the activation email.</Typography>
        <form className={clsx(homeStyles.vlayout, homeStyles.fullwidth)} style={{ justifyContent: 'center', gap: 32}}
            onSubmit={(evt) => {
                evt.preventDefault()
                onClickSend()
            }}>

            {commonHelp && <FormHelperText error={commonHelp.error}>
                {commonHelp.message}
            </FormHelperText>}

            <div className={clsx(homeStyles.hlayout, homeStyles.fullwidth)} style={{ padding: 8, justifyContent: 'end', gap: 24 }}>
                <Button onClick={onClickSend} variant='contained' disabled={updating} type="submit">Resend Activation Mail</Button>
            </div>

        </form>
    </div>
}