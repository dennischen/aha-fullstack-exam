import '@testing-library/jest-dom'

import { DEFAULT_LANGUAGE } from '@/app/exam/constants'
import { SampleService } from './SampleService'

const mockGetUser = jest.fn(() => Promise.resolve({ id: 1, name: 'John Doe' }))
jest.mock('./SampleService', () => {
    return {
        SampleService: jest.fn().mockImplementation(() => ({
            getUser: mockGetUser,
        })),
    }
})

describe('Sample Test', () => {
    it('default language is en', () => {
        expect(DEFAULT_LANGUAGE).toBe('en')
    })
    it('mock a implementation', async () => {
        

        const sampleService = new SampleService()
        const user = await sampleService.getUser(1)
        expect(user).toEqual({ id: 1, name: 'John Doe' })
    })
})
