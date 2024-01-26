'use client'

/*
 * 
 * @author: Dennis Chen
 */

import { UserInfoPage, UserInfoQuery } from '@/app/api/v0/dto'
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
import Pagination from '@mui/material/Pagination'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Typography from '@mui/material/Typography'
import { useWorkspace } from '@nextspace'
import axios, { AxiosError } from 'axios'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

type Props = {
    authToken: string,
    expanded: boolean,
    onExpand: (expanded: boolean) => void
    onUnauthenticated: () => void
}

const preferredDatetimeFormat = 'YYYY-MM-DD HH:mm:ss'

export default function UserList({ authToken, expanded, onExpand, onUnauthenticated }: Props) {

    const { envVariables } = useWorkspace()
    const [commonHelp, setCommonHelp] = useState<CommonHelp>()
    const [userInfoPage, setUserInfoPage] = useState<UserInfoPage>()
    const [userInfoQuery, setUserInfoQuery] = useState<UserInfoQuery>({
        index: 0,
        pageSize: 10,
        orderBy: {
            field: 'signedupDatetime',
            desc: true
        }
    })
    const [querying, setQuerying] = useState(false)


    const queryUserInfo = useCallback((query: UserInfoQuery) => {
        setCommonHelp(undefined)
        setQuerying(true)
        const data: UserInfoQuery = query
        axios.post(`${envVariables.API_BASE_URL}/api/v0/adm/users`, data, {
            headers: {
                authToken
            }
        }).then((res) => {
            const page: UserInfoPage = res.data
            setUserInfoPage(page)
            setUserInfoQuery(query)
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

    const onPage = (page: number) => {
        queryUserInfo({ ...userInfoQuery, ...{ index: page } })
    }

    const onSort = (field: string) => {
        const orderBy = userInfoQuery.orderBy!
        const desc = (orderBy.field === field) ? !orderBy.desc : orderBy.desc
        queryUserInfo({ ...userInfoQuery, ...{ orderBy: { field, desc } } })
    }

    useEffect(() => {
        if (expanded) {
            queryUserInfo(userInfoQuery)
        }
    }, [expanded, queryUserInfo, userInfoQuery])

    const orderBy = userInfoQuery.orderBy!

    return <Accordion expanded={expanded} onChange={(evt, expanded) => { onExpand(expanded) }}>
        <AccordionSummary
            className={homeStyles.accordionSummary}
            expandIcon={<ArrowDropDownIcon />}>
            <div className={homeStyles.hlayout} style={{ gap: 8 }}>
                <Typography>User List</Typography>
                {querying && <CircularProgress size={20} />}
            </div>
        </AccordionSummary>
        <AccordionDetails>
            <div className={homeStyles.vlayout} style={{ justifyContent: 'center', gap: 32 }}>
                {commonHelp?.error ?
                    <Button onClick={() => { queryUserInfo(userInfoQuery) }} disabled={querying}>Query again</Button>
                    : userInfoPage ? <>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy.field === 'email'}
                                            direction={orderBy.desc ? 'desc' : 'asc'}
                                            onClick={() => { onSort('email') }}
                                            disabled={querying}>E-Mail</TableSortLabel></TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy.field === 'displayName'}
                                            direction={orderBy.desc ? 'desc' : 'asc'}
                                            onClick={() => { onSort('displayName') }}
                                            disabled={querying}>Name</TableSortLabel></TableCell>
                                    <TableCell align="right" className={homeStyles.displayNoneInXs}>
                                        <TableSortLabel
                                            active={orderBy.field === 'signedupDatetime'}
                                            direction={orderBy.desc ? 'desc' : 'asc'}
                                            onClick={() => { onSort('signedupDatetime') }}
                                            disabled={querying}>Signedup Datetime</TableSortLabel></TableCell>
                                    <TableCell align="right" className={homeStyles.displayNoneInSm}>
                                        <TableSortLabel
                                            active={orderBy.field === 'lastAccessDatetime'}
                                            direction={orderBy.desc ? 'desc' : 'asc'}
                                            onClick={() => { onSort('lastAccessDatetime') }}
                                            disabled={querying}>Access datetime</TableSortLabel></TableCell>
                                    <TableCell align="right">Login Count</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {userInfoPage.content.map((user, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell component="th" scope="row">
                                            {user.email}
                                        </TableCell>
                                        <TableCell>{user.displayName}</TableCell>
                                        <TableCell align="right" className={homeStyles.displayNoneInXs}>{moment(user.signedupDatetime).format(preferredDatetimeFormat)}</TableCell>
                                        <TableCell align="right" className={homeStyles.displayNoneInSm}>{user.lastAccessDatetime ? moment(user.lastAccessDatetime).format(preferredDatetimeFormat) : ''}</TableCell>
                                        <TableCell align="right">{user.loginCount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Pagination count={userInfoPage.totalPages} page={userInfoPage.index + 1} disabled={querying} onChange={(evt, page) => { onPage(page - 1) }} />
                    </>
                        : <Skeleton variant="rounded" height={100} className={homeStyles.fullwidth} />}

                {commonHelp && <FormHelperText error={commonHelp.error}>
                    {commonHelp.message}
                </FormHelperText>}
            </div>
        </AccordionDetails>
    </Accordion>
}