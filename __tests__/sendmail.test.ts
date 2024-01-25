import '@testing-library/jest-dom'

import { sendActivationEamil } from '@/app/api/v0/utils'

const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS

if (!pass || !user) {
    describe('No Mail Config', () => {
        it('will ignore this test because of lack of smtp config', () => {
            console.log(user)
        })
    })
} else {
    describe('Sample Test', () => {
        it('default language is en', async () => {
            await sendActivationEamil({ displayName: 'XYZ', email: 'atticcat@gmail.com' } as any, { token: '1234' } as any)
        })
    })
}
