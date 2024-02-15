
/*
 * @author: Dennis Chen
 */


import { ServiceContext, ServiceError } from "."
import MySqlServiceContext from "./MySqlServiceContext"


export default async function withServiceContext<T>(task: (props: { context: ServiceContext }) => Promise<T>) {
    const context = new MySqlServiceContext()
    try {
        const response = await task({ context })
        if (context.hasTx()) {
            await context.commit()
        }
        return response
    } catch (err: any) {
        if (context.hasTx()) {
            await context.rollback()
        }
        if (err instanceof ServiceError) {
            console.error(`An service error `, err)
        }else{
            console.error("An unknow error in service context.", err)
        }
    } finally {
        await context.release()
    }
}
