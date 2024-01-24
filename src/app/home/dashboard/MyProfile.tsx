'use client'

/*
 * 
 * @author: Dennis Chen
 */

import { Profile, UpdateProfileForm, UpdateProfileFormSchema } from '@/app/api/v0/dto'
import { getErrorCommonHelp } from '@/app/home/client-utils'
import homeStyles from "@/app/home/home.module.scss"
import { CommonHelp } from "@/app/home/types"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import FormHelperText from '@mui/material/FormHelperText'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import axios, { AxiosError } from 'axios'
import clsx from 'clsx'
import { Validator } from 'jsonschema'
import { useCallback, useState } from 'react'

const scheamValidator = new Validator()

type Props = {
    authToken: string,
    profile: Profile,
    expanded: boolean,
    onExpand: (expanded: boolean) => void
    onUpdateProfile: (profile: Profile) => void
    onUnauthenticated: () => void
}

export default function MyProfile({ authToken, profile, expanded, onExpand, onUnauthenticated, onUpdateProfile }: Props) {

    const [displayName, setDisplayName] = useState(profile.displayName ?? '')
    const [displayNameHelp, setDisplayNameHelp] = useState('')

    const [commonHelp, setCommonHelp] = useState<CommonHelp>()
    const [updating, setUpdating] = useState(false)

    const onClickUpdate = useCallback(() => {

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

            const data: UpdateProfileForm = {
                displayName
            }

            axios.post(`/api/v0/pri/profile`, data, {
                headers: {
                    authToken
                }
            }).then((res) => {
                const profile = res.data as Profile
                setDisplayName(profile.displayName)
                onUpdateProfile(profile)
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

    }, [authToken, onUnauthenticated, onUpdateProfile, displayName])

    return <Accordion expanded={expanded} onChange={(evt, expanded) => { onExpand(expanded) }}>
        <AccordionSummary
            className={homeStyles.accordionSummary}
            expandIcon={<ArrowDropDownIcon />}>
            <div className={homeStyles.hlayout} style={{ gap: 8 }}>
                <Typography>My Profile</Typography>
                {updating && <CircularProgress size={20} />}
            </div>
        </AccordionSummary>
        <AccordionDetails>
            <form className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32 }}
                onSubmit={(evt) => {
                    evt.preventDefault()
                    onClickUpdate()
                }}>
                <TextField
                    required
                    label="Display Name"
                    placeholder='Foo Bar'
                    InputLabelProps={{
                        shrink: true,
                    }}
                    className={homeStyles.fullwidth}
                    value={displayName}
                    onChange={(evt) => {
                        setDisplayName(evt.target.value)
                        setDisplayNameHelp('')
                    }}
                    error={!!displayNameHelp}
                    helperText={displayNameHelp}
                    disabled={updating}
                ></TextField>

                {commonHelp && <FormHelperText error={commonHelp.error}>
                    {commonHelp.message}
                </FormHelperText>}

                <div className={clsx(homeStyles.hlayout, homeStyles.fullwidth)} style={{ padding: 8, justifyContent: 'end', gap: 24 }}>
                    <Button onClick={onClickUpdate} variant='contained' disabled={updating} type="submit">Update</Button>
                </div>

            </form>
        </AccordionDetails>
    </Accordion >
}