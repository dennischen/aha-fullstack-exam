'use client'

/*
 * 
 * @author: Dennis Chen
 */

import { CommonResponse, UpdatePasswordForm, UpdatePasswordFormSchema, passwordPattern, passwordPatternMsg } from '@/app/api/v0/dto'
import { getErrorCommonHelp } from '@/app/home/client-utils'
import VisibilityAdornment from '@/app/home/components/VisibilityInputAdornment'
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
    expanded: boolean,
    onExpand: (expanded: boolean) => void
    onUnauthenticated: () => void
}

export default function MyPassword({ authToken, expanded, onExpand, onUnauthenticated, }: Props) {

    const [currentPassword, setCurrentPassword] = useState('')
    const [currentPasswordHelp, setCurrentPasswordHelp] = useState('')
    const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [newPasswordHelp, setNewPasswordHelp] = useState('')
    const [newPasswordVisible, setNewPasswordVisible] = useState(false)
    const [newPasswordVerify, setNewPsswordVerify] = useState('')
    const [newPasswordVerifyHelp, setNewPasswordVerifyHelp] = useState('')
    const [newPasswordVerifyVisible, setNewPasswordVerifyVisible] = useState(false)

    const [commonHelp, setCommonHelp] = useState<CommonHelp>()
    const [updating, setUpdating] = useState(false)

    const onClickUpdate = useCallback(() => {

        let invalid = false

        let v = scheamValidator.validate(currentPassword, { minLength: 1 }, { required: true })
        if (!v.valid) {
            setCurrentPasswordHelp(v.errors.map((e) => e.message).join(', '))
            invalid = true
        } else {
            setCurrentPasswordHelp('')
        }

        v = scheamValidator.validate(newPassword, UpdatePasswordFormSchema.properties!.newPassword, { required: true })
        if (!v.valid) {
            setNewPasswordHelp(v.errors.map((e) => e.message).join(', '))
            invalid = true
        } else {
            if (!passwordPattern.test(newPassword)) {
                setNewPasswordHelp(passwordPatternMsg)
                invalid = true
            } else {
                setNewPasswordHelp('')
            }
        }

        //password verify
        if ((newPasswordVerify !== newPassword)) {
            setNewPasswordVerifyHelp("doen't not match the new password")
            invalid = true
        } else {
            setNewPasswordVerifyHelp('')
        }


        setCommonHelp(undefined)

        if (!invalid) {
            setUpdating(true)

            const data: UpdatePasswordForm = {
                password: currentPassword,
                newPassword
            }

            axios.post(`/api/v0/pri/password`, data, {
                headers: {
                    authToken
                }
            }).then((res) => {
                const cr: CommonResponse = res.data
                setCommonHelp(cr)
                setCurrentPassword('')
                setNewPassword('')
                setNewPsswordVerify('')
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

    }, [authToken, onUnauthenticated, currentPassword, newPassword, newPasswordVerify])

    return <Accordion expanded={expanded} onChange={(evt, expanded) => { onExpand(expanded) }}>
        <AccordionSummary
            className={homeStyles.accordionSummary}
            expandIcon={<ArrowDropDownIcon />}>
            <div className={homeStyles.hlayout} style={{ gap: 8 }}>
                <Typography>My Password</Typography>
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
                    label="Current Password"
                    placeholder='P@sSw0rD'
                    InputLabelProps={{
                        shrink: true,
                    }}
                    type={currentPasswordVisible ? "text" : "password"}
                    InputProps={{
                        endAdornment: <VisibilityAdornment visible={currentPasswordVisible}
                            onClick={() => { setCurrentPasswordVisible(!currentPasswordVisible) }}
                        />
                    }}
                    className={clsx(homeStyles.fullwidth)}
                    value={currentPassword}
                    onChange={(evt) => {
                        setCurrentPassword(evt.target.value)
                        setCurrentPasswordHelp('')
                    }}
                    error={!!currentPasswordHelp}
                    helperText={currentPasswordHelp}
                    disabled={updating}
                ></TextField>
                <TextField
                    required
                    label="New Password"
                    placeholder='P@sSw0rD'
                    InputLabelProps={{
                        shrink: true,
                    }}
                    type={newPasswordVisible ? "text" : "password"}
                    InputProps={{
                        endAdornment: <VisibilityAdornment visible={newPasswordVisible}
                            onClick={() => { setNewPasswordVisible(!newPasswordVisible) }}
                        />
                    }}
                    className={clsx(homeStyles.fullwidth)}
                    value={newPassword}
                    onChange={(evt) => {
                        setNewPassword(evt.target.value)
                        setNewPasswordHelp('')
                    }}
                    error={!!newPasswordHelp}
                    helperText={newPasswordHelp}
                    disabled={updating}
                ></TextField>
                <TextField
                    required
                    label="New Password Verfication"
                    placeholder='P@sSw0rD'
                    InputLabelProps={{
                        shrink: true,
                    }}
                    type={newPasswordVerifyVisible ? "text" : "password"}
                    InputProps={{
                        endAdornment: <VisibilityAdornment visible={newPasswordVerifyVisible}
                            onClick={() => { setNewPasswordVerifyVisible(!newPasswordVerifyVisible) }}
                        />
                    }}
                    className={clsx(homeStyles.fullwidth)}
                    value={newPasswordVerify}
                    onChange={(evt) => {
                        setNewPsswordVerify(evt.target.value)
                        setNewPasswordVerifyHelp('')
                    }}
                    error={!!newPasswordVerifyHelp}
                    helperText={newPasswordVerifyHelp}
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
    </Accordion>
}