
/*
 * @author: Dennis Chen
 */

import { ServiceError } from "@/service"
import { ApiContext, ApiError } from "."
import MySqlApiContext from "./MySqlApiContext"
import { CommonResponse } from "./dto"
import { responseJson } from "./utils"


export default async function withApiContext(task: (props: { context: ApiContext }) => Promise<Response>) {
    const context = new MySqlApiContext()
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
        if (err instanceof ApiError) {
            return responseJson<CommonResponse>({ message: err.message, error: true }, { status: err.code || 400 })
        } else if (err instanceof ServiceError) {
            if (err.code && err.code < 500 && err.code >= 400) {
                return responseJson<CommonResponse>({ message: err.message, error: true }, { status: err.code })
            } else {
                console.error("An service error in api context.", err)
                return responseJson<CommonResponse>({ message: err.message, error: true }, { status: 500 })
            }
        }
        console.error("An unknow error in api context.", err)
        return responseJson<CommonResponse>({ message: err?.message ?? 'Unknown error', error: true }, { status: 500 })
    } finally {
        await context.release()
    }
}
