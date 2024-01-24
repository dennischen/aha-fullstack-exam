'use client'

/*
 * 
 * @author: Dennis Chen
 */

import { Profile } from '@/app/api/v0/dto'
import { cleanClientAuthentication, getCookieAuthToken, getErrorCommonHelp, getSessionStoreObject, setClientAuthentication, setSessionStoreItem } from '@/app/home/client-utils'
import homeStyles from '@/app/home/home.module.scss'
import FormHelperText from '@mui/material/FormHelperText'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import axios, { AxiosError } from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { CommonHelp } from "@/app/home/types"

import clsx from 'clsx'
import MyPassword from './MyPassword'
import MyProfile from './MyProfile'
import SendActivation from './SendActivation'
import UserList from './UserList'
import UserStatastics from './UserStatastics'

export type ThePageProps = {}

export default function ThePage({ }: ThePageProps) {
    const router = useRouter()

    const [commonHelp, setCommonHelp] = useState<CommonHelp>()

    const [authToken, setAuthToken] = useState('')
    const [profile, setProfile] = useState<Profile>()

    const [panel, setPanel] = useState('')

    useEffect(() => {
        const authToken = getCookieAuthToken()
        if (authToken) {
            setAuthToken(authToken)
        } else {
            router.refresh()
            router.push('/home')
        }
        const profile = getSessionStoreObject<Profile>('profile')
        if (profile) {
            setProfile(profile)
        } else if (authToken) {
            axios.get(`/api/v0/pri/profile`, {
                headers: {
                    authToken: authToken
                }
            }).then((res) => {
                const profile = res.data as Profile
                setProfile(profile)
                setClientAuthentication({ authToken, profile })
            }).catch((err: AxiosError) => {
                if (err.request.status === 401) {
                    //token is invlidate, redirect to home
                    cleanClientAuthentication()
                    router.refresh()
                    router.push('/home')
                } else {
                    setCommonHelp(getErrorCommonHelp(err))
                }
            })
        }
    }, [router])

    const togglePanel = useCallback((panel: string, exapned: boolean) => {
        if (exapned) {
            setPanel(panel)
        } else {
            setPanel('')
        }
    }, [])

    const onUnauthenticated = useCallback(() => {
        //token is invlidate, redirect to home
        cleanClientAuthentication()
        router.refresh()
        router.push('/home')
    }, [router])

    const onUpdateProfile = useCallback((profile: Profile) => {
        setProfile(profile)
        setSessionStoreItem('profile', profile)
    }, [])

    return <main className={homeStyles.main}>
        <Paper elevation={1} className={homeStyles.mainPaper}>
            <div className={homeStyles.vlayout} style={{ padding: 16, justifyContent: 'center', gap: 32, width: 800 }}>
                <Typography variant='h6' >Dashboard{profile && `, ${profile.displayName}`}</Typography>

                {authToken && profile ?
                    profile.activated ?
                        <div className={homeStyles.fullwidth}>
                            <MyProfile authToken={authToken} profile={profile} expanded={panel === 'myprofile'} onExpand={(expanded) => { togglePanel('myprofile', expanded) }}
                                onUpdateProfile={onUpdateProfile} onUnauthenticated={onUnauthenticated} />
                            <MyPassword authToken={authToken} expanded={panel === 'mypassword'} onExpand={(expanded) => { togglePanel('mypassword', expanded) }} onUnauthenticated={onUnauthenticated} />
                            <UserList authToken={authToken} expanded={panel === 'userlist'} onExpand={(expanded) => { togglePanel('userlist', expanded) }} onUnauthenticated={onUnauthenticated} />
                            <UserStatastics authToken={authToken} expanded={panel === 'userstatastics'} onExpand={(expanded) => { togglePanel('userstatastics', expanded) }} onUnauthenticated={onUnauthenticated} />
                        </div>
                        : <SendActivation authToken={authToken} profile={profile} onUnauthenticated={onUnauthenticated} />
                    : <Skeleton variant="rounded" height={100} className={homeStyles.fullwidth} />}


                {commonHelp && <FormHelperText error={commonHelp.error}>
                    {commonHelp.message}
                </FormHelperText>}

            </div>
        </Paper>
        <div className={clsx(homeStyles.hlayout, homeStyles.fullwidth)} style={{ padding: 8, justifyContent: 'center', gap: 24 }}>
            <Link href='/home/signout'>Signout</Link>
        </div>
    </main>
}
