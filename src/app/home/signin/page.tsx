
/*
 * 
 * @author: Dennis Chen
 */

import { findAuthenticationInCookie } from "@/app/home/server-utils"
import ThePage from "./ThePage"

//This async page demos the way to combine with server component + client component + ssr in new nextjs.
//However it require server to fetch authentication for the request to this page to backend (not really to local host, the ui and api site is possible different).
//It might have some extra loading than only client component

export default async function page() {

    const authentication = await findAuthenticationInCookie()

    return <ThePage authToken={authentication?.authToken} profile={authentication?.profile} />
}