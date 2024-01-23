import '@testing-library/jest-dom'

import { DEFAULT_LANGUAGE } from '@/app/exam/constants'
import { sendActivationEamil } from '@/app/api/v0/utils'
import { partial } from 'cypress/types/lodash'



describe('Sample Test', () => {
    it('default language is en', async () => {
        await sendActivationEamil({ displayName: 'XYZ', email: 'atticcat@gmail.com' } as any, { token: '1234' } as any)
    })
})
