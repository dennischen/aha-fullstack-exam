/*
 * @author: Dennis Chen
 */

import { parseExpression } from 'cron-parser'
import moment from 'moment'
import 'moment-timezone'
import nodeSchedule from 'node-schedule'
import withServiceContext from './withServiceContext'

const CRON_DAILY_ACTIVE_USER = process.env.CRON_DAILY_ACTIVE_USER || '0 59 23 * * *'
const SCHEDULER_TIMEZONE = process.env.SCHEDULER_TIMEZONE || 'UTC'

export async function schedule() {
    //we need to set timezone to utc, can't use cron expression directly

    scheduleTask(CRON_DAILY_ACTIVE_USER, skipStillRunning(collectDailyActiveUser), 'collectDailyActiveUser')

}

function scheduleTask<T>(expression: string, task: (fireDate: Date) => Promise<T>, name?: string) {
    let job = nodeSchedule.scheduleJob(newRecurrentRule(expression), task)
    if (!job) {
        console.error(`    - Schedule ${name || task.name} fail, cron: ${CRON_DAILY_ACTIVE_USER}, timezone: ${SCHEDULER_TIMEZONE}`)
    } else {
        console.log(`    - Scheduled: ${name || task.name}, cron: ${CRON_DAILY_ACTIVE_USER}, timezone: ${SCHEDULER_TIMEZONE}`)
    }
    return job
}

function newRecurrentRule(expression: string) {
    let expr = parseExpression(expression)

    const rule = new nodeSchedule.RecurrenceRule()
    rule.second = expr.fields.second as number[]
    rule.minute = expr.fields.minute as number[]
    rule.hour = expr.fields.hour as number[]
    rule.date = expr.fields.dayOfMonth as number[]
    rule.dayOfWeek = expr.fields.dayOfWeek as number[]
    rule.month = expr.fields.month as number[]
    rule.tz = SCHEDULER_TIMEZONE

    return rule
}

function skipStillRunning<T>(task: (fireDate: Date) => Promise<T>): (fireDate: Date) => Promise<T | undefined> {
    const fnRunning = async (fireDate: Date) => {
        if (!(task as any).__stillRunning) {
            try {
                (task as any).__stillRunning = true
                return await task(fireDate)
            } finally {
                delete (task as any).__stillRunning
            }
        }
    }
    return fnRunning
}

async function wait(t: number) {
    return new Promise((resolve, rejct) => {
        setTimeout(() => {
            resolve(undefined)
        }, t)
    })
}

async function collectDailyActiveUser(fireDate: Date) {
    const fd = moment(fireDate).tz(SCHEDULER_TIMEZONE)
    const date = parseInt(fd.format('YYYYMMDD'))
    const momentStartFireDate = fd.clone().startOf('date')
    const momentEndFireDate = fd.clone().endOf('date')
    return withServiceContext(async ({ context }) => {
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
    })
}