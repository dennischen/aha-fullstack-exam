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
import CircularProgress from '@mui/material/CircularProgress'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useWorkspace } from '@nextspace'
import axios, { AxiosError } from 'axios'
import { useCallback, useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

type Props = {
    authToken: string,
    expanded: boolean,
    onExpand: (expanded: boolean) => void
    onUnauthenticated: () => void
}

const AvgActiveUserIn7DaysRollingChart = dynamic(() => import('./AvgActiveUserIn7DaysRollingChart'), { loading: () => <p>Loading...</p> })

export default function UserStatisticsView({ authToken, expanded, onExpand, onUnauthenticated }: Props) {

    const { envVariables } = useWorkspace()
    const [commonHelp, setCommonHelp] = useState<CommonHelp>()
    const [userStatastics, setUserStatastics] = useState<UserStatistics>()
    const [querying, setQuerying] = useState(false)


    const queryUserStatastics = useCallback(() => {
        setCommonHelp(undefined)
        setQuerying(true)
        axios.get(`${envVariables.API_BASE_URL}/api/v0/adm/user-statistics`, {
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
    }, [envVariables, authToken, onUnauthenticated])

    useEffect(() => {
        if (expanded) {
            queryUserStatastics()
        }
    }, [expanded, queryUserStatastics])


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
            <div className={homeStyles.vlayout} style={{ alignItems: 'stretch', gap: 32 }}>
                {commonHelp?.error ?
                    <Button onClick={queryUserStatastics} disabled={querying}>Query again</Button>
                    : userStatastics ? <>
                        <TextField
                            label="Total Signedup User"
                            InputLabelProps={{
                                shrink: true,
                            }}

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

                            value={userStatastics.totalActiveUserToday}
                            InputProps={{
                                readOnly: true,
                                inputProps: {
                                    style: { textAlign: "right" },
                                }
                            }}
                            variant='standard'
                        ></TextField>
                        <div className={homeStyles.vlayout} style={{ alignItems: 'stretch', gap: 8 }}>
                            <InputLabel shrink>Average Activate user in 7 Days Rolling</InputLabel>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center" >Date</TableCell>
                                        <TableCell align="right" >Average</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {userStatastics.avgActiveUserIn7DaysRolling.map((vod, idx) => {
                                        return <TableRow key={idx}>
                                            <TableCell align="center" >{vod.date}</TableCell>
                                            <TableCell align="right" >{vod.value}</TableCell>
                                        </TableRow>
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                        
                        {//dynamic load only when expanded
                        expanded && <AvgActiveUserIn7DaysRollingChart data={userStatastics.avgActiveUserIn7DaysRolling}/>
                        }
                    </>
                        : <Skeleton variant="rounded" height={100} className={homeStyles.fullwidth} />}

                {commonHelp && <FormHelperText error={commonHelp.error}>
                    {commonHelp.message}
                </FormHelperText>}
            </div>
        </AccordionDetails>
    </Accordion>
}