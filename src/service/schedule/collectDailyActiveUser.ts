/*
 * @author: Dennis Chen
 */

import type { ScheduleProps } from '@/service/scheduler'
import moment from 'moment'
import 'moment-timezone'

export default async function collectDailyActiveUser(props: ScheduleProps) {
    
    const {fireDate, timezone, context} = props

    const fd = moment(fireDate).tz(timezone)
    const date = parseInt(fd.format('YYYYMMDD'))
    const momentStartFireDate = fd.clone().startOf('date')
    const momentEndFireDate = fd.clone().endOf('date')

    console.log(`Run collectDailyActiveUser at ${fd.format()}(${timezone}) for date ${date}`)

    const authSessionDao = await context.getAuthSessionDao()
    const totalActiveUser = await authSessionDao.countActiveUserBetween(momentStartFireDate.valueOf(), momentEndFireDate.valueOf())

    const dailyActiveUserDao = await context.getDailyActiveUserDao()
    const dailyActiveUser = await dailyActiveUserDao.find(date)
    if (dailyActiveUser) {
        //update
        if (totalActiveUser > dailyActiveUser.count) {
            await dailyActiveUserDao.update(date, { count: totalActiveUser })
        }

    } else {
        await dailyActiveUserDao.create({ date, count: totalActiveUser })
    }
}

async function wait(t: number) {
    return new Promise((resolve, rejct) => {
        setTimeout(() => {
            resolve(undefined)
        }, t)
    })
}