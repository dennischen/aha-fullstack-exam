'use client'

/*
 * 
 * @author: Dennis Chen
 */

import { UserStatistics } from '@/app/api/v0/dto'
import { getErrorCommonHelp } from '@/app/home/client-utils'
import homeStyles from "@/app/home/home.module.scss"
import { CommonHelp } from "@/app/home/types"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import FormHelperText from '@mui/material/FormHelperText'
import Skeleton from '@mui/material/Skeleton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import axios, { AxiosError } from 'axios'
import { useCallback, useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'

type Props = {
    authToken: string,
    expanded: boolean,
    onExpand: (expanded: boolean) => void
    onUnauthenticated: () => void
}

export default function UserStatisticsView({ authToken, expanded, onExpand, onUnauthenticated }: Props) {


    const [commonHelp, setCommonHelp] = useState<CommonHelp>()
    const [userStatastics, setUserStatastics] = useState<UserStatistics>()
    const [querying, setQuerying] = useState(false)


    const queryUserStatastics = useCallback(() => {
        setCommonHelp(undefined)
        setQuerying(true)
        axios.get(`/api/v0/adm/user-statistics`, {
            headers: {
                authToken
            }
        }).then((res) => {
            const userStatastics: UserStatistics = res.data
            setUserStatastics(userStatastics)
        }).catch((err: AxiosError) => {
            if (err.request.status === 401) {
                onUnauthenticated()
            } else {
                setCommonHelp(getErrorCommonHelp(err))
            }
        }).finally(() => {
            setQuerying(false)
        })
    }, [])

    useEffect(() => {
        if (expanded) {
            queryUserStatastics()
        }
    }, [expanded])


    return <Accordion expanded={expanded} onChange={(evt, expanded) => { onExpand(expanded) }}>
        <AccordionSummary
            className={homeStyles.accordionSummary}
            expandIcon={<ArrowDropDownIcon />}>
            <div className={homeStyles.hlayout} style={{ gap: 8 }}>
                <Typography>User Statastics</Typography>
                {querying && <CircularProgress size={20} />}
            </div>
        </AccordionSummary>
        <AccordionDetails>
            <div className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32 }}>
                {commonHelp?.error ?
                    <Button onClick={queryUserStatastics} disabled={querying}>Query again</Button>
                    : userStatastics ? <>
                        <TextField
                            label="Total Signedup User"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            className={homeStyles.fullwidth}
                            value={userStatastics.totalSignedUpUser}
                            InputProps={{
                                readOnly: true,
                                inputProps: {
                                    style: { textAlign: "right" },
                                }
                            }}
                            variant='standard'
                        ></TextField>
                        <TextField
                            label="Total Activate User Today"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            className={homeStyles.fullwidth}
                            value={userStatastics.totalActiveUserToday}
                            InputProps={{
                                readOnly: true,
                                inputProps: {
                                    style: { textAlign: "right" },
                                }
                            }}
                            variant='standard'
                        ></TextField>
                        <TextField
                            label="Average Activate user in 7 Days"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            className={homeStyles.fullwidth}
                            value={userStatastics.avgActiveUserIn7Days}
                            InputProps={{
                                readOnly: true,
                                inputProps: {
                                    style: { textAlign: "right" },
                                }
                            }}
                            variant='standard'
                            helperText={
                                <span style={{ color: 'orange' }} >This value is not implemented yet</span>
                            }
                        ></TextField>
                    </>
                        : <Skeleton variant="rounded" height={100} className={homeStyles.fullwidth} />}

                {commonHelp && <FormHelperText error={commonHelp.error}>
                    {commonHelp.message}
                </FormHelperText>}
            </div>
        </AccordionDetails>
    </Accordion>
}