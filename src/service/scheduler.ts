/*
 * @author: Dennis Chen
 */

import { parseExpression } from 'cron-parser'
import nodeSchedule from 'node-schedule'
import { ServiceContext, ServiceError } from '.'
import collectDailyActiveUser from './schedule/collectDailyActiveUser'
import withServiceContext from './withServiceContext'

const CRON_DAILY_ACTIVE_USER = process.env.CRON_DAILY_ACTIVE_USER || '30 59 * * * *'
const SCHEDULER_TIMEZONE = process.env.SCHEDULER_TIMEZONE || 'UTC'

export type ScheduleProps = {
    fireDate: Date
    context: ServiceContext
    timezone: string
}

export async function schedule() {
    //we need to set timezone to utc, can't use cron expression directly

    scheduleTask(CRON_DAILY_ACTIVE_USER, withSkipStillRunning(withSchedulerServiceContext(collectDailyActiveUser)), 'CollectDailyActiveUser')

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

function withSkipStillRunning<T>(task: (fireDate: Date) => Promise<T>): (fireDate: Date) => Promise<T | undefined> {
    return async (fireDate: Date) => {
        if (!(task as any).__stillRunning) {
            try {
                (task as any).__stillRunning = true
                return await task(fireDate)
            } finally {
                delete (task as any).__stillRunning
            }
        }
    }
}

function withSchedulerServiceContext<T>(task: (prop: ScheduleProps) => Promise<T>): (fireDate: Date) => Promise<T | undefined> {
    return async (fireDate: Date) => {
        try {
            return await withServiceContext(async ({ context }) => {
                return await task({ context, fireDate, timezone: SCHEDULER_TIMEZONE })
            })
        } catch (err) {
            if (err instanceof ServiceError) {
                console.error('A service error in scheduled task.', err)
            } else {
                console.error('An unknow error in scheduled task.', err)
            }
        }
    }
}
