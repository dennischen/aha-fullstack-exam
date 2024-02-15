/*
 * @author: Dennis Chen
 */


const SCHEDULER = process.env.SCHEDULER

export async function register() {

    //fix Module not found: Can't resolve 'crypto'
    //https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
    if (process.env.NEXT_RUNTIME === "nodejs") {
        console.log("    Scheduler", SCHEDULER || 'off')
        if (SCHEDULER && ['on', 'yes', 'true'].indexOf(SCHEDULER.toLowerCase()) >= 0) {
            await import('./service/scheduler').then((m)=>{
                return m.schedule()
            })
        }
    }
}