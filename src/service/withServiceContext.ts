
/*
 * @author: Dennis Chen
 */


import { ServiceContext } from "."
import MySqlServiceContext from "./MySqlServiceContext"


export default async function withServiceContext<T>(task: (props: { context: ServiceContext }) => Promise<T>) {
    const context = new MySqlServiceContext()
    try {
        const result = await task({ context })
        if (context.hasTx()) {
            await context.commit()
        }
        return result
    } catch (err: any) {
        if (context.hasTx()) {
            await context.rollback()
        }
        throw err
    } finally {
        await context.release()
    }
}
