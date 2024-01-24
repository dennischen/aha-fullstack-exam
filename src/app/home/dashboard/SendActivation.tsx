'use client'

/*
 * 
 * @author: Dennis Chen
 */

import { CommonResponse, Profile, UpdateProfileFormSchema } from '@/app/api/v0/dto'
import homeStyles from "@/app/home/home.module.scss"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import FormHelperText from '@mui/material/FormHelperText'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import axios, { AxiosError } from 'axios'
import { Validator } from 'jsonschema'
import { useCallback, useState } from 'react'
import { getErrorCommonHelp } from '../client-utils'
import clsx from 'clsx'
import { CommonHelp } from "@/app/home/types"

const scheamValidator = new Validator()

type Props = {
    authToken: string,
    profile: Profile,
    onUnauthenticated: () => void
}

export default function SendActivation({ authToken, profile, onUnauthenticated }: Props) {


    const [displayName, setDisplayName] = useState(profile.displayName ?? '')
    const [displayNameHelp, setDisplayNameHelp] = useState('')

    const [commonHelp, setCommonHelp] = useState<CommonHelp>()
    const [updating, setUpdating] = useState(false)

    const onClickSend = useCallback(() => {

        let invalid = false


        //displayname
        const dn = displayName.trim()
        let v = scheamValidator.validate(dn, UpdateProfileFormSchema.properties!.displayName, { required: true })
        if (!v.valid) {
            setDisplayNameHelp(v.errors.map((e) => e.message).join(', '))
            invalid = true
        } else {
            setDisplayNameHelp('')
        }

        setCommonHelp(undefined)

        if (!invalid) {
            setUpdating(true)

            axios.get(`/api/v0/pri/send-activation`, {
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

        }

    }, [authToken, onUnauthenticated, displayName])

    return <div className={homeStyles.vlayout}>
        <Typography>The account associated with {profile.displayName} has not been activated yet. Kindly activate it first by clicking the button below to resend the activation email.</Typography>
        <form className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32 }}
            onSubmit={(evt) => {
                evt.preventDefault()
                onClickSend()
            }}>

            {commonHelp && <FormHelperText error={commonHelp.error}>
                {commonHelp.message}
            </FormHelperText>}

            <div className={clsx(homeStyles.hlayout, homeStyles.fullwidth)} style={{ padding: 8, justifyContent: 'end', gap: 24 }}>
                <Button onClick={onClickSend} variant='contained' disabled={updating} type="submit">Resent Activation Mail</Button>
            </div>

        </form>
    </div>
}