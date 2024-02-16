
/*
 * Public signup page
 * @author: Dennis Chen
 */

import { redirect } from "next/navigation"
import { findAuthTokenInCookie } from "@/app/home/server-utils"
import ThePage from "./ThePage"

//not like signin page that checks authToken and validate in server component, 
//the remain pages use client-component and use effect to validate authToken
export default function page() {
    const authToken = findAuthTokenInCookie()

    if(authToken){
        //there is a authToken, I assumpt user has loged in, so redirect to dashboard.
        //in dashboard(and other auth-required page), it will check if authToken is still available by use effect
        redirect('/home/dashboard')
        
    }else{
        return <ThePage/>
    }
}