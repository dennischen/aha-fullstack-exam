import '@testing-library/jest-dom'

import { DEFAULT_LANGUAGE } from '@/app/exam/constants'
import { SampleService } from './SampleService'

import { Schema, Validator } from 'jsonschema'
import { UserCreate, UserCreateSchema } from '@/service/entity'
import { checkArgument } from '@/service/impl/utils'
import { ServiceError, validator } from '@/service'

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
    it('test json-schema', async () => {
        let v = new Validator()
        // let instance = 4
        // let schema:Schema = { "type": "number" }
        // console.log(">>>>", v.validate(instance, schema))



        let userCreate: UserCreate = {
            email: 'a@b.c.',
            displayName: '',
            hashedPassword: ''
        }
        try {
            checkArgument(validator, UserCreateSchema, userCreate)
        } catch (err: any) {
            if(err instanceof ServiceError){
                console.log(">>>>", err.code, err.message)
            }else{
                console.log(">>>>", err)
            }
        }

    })
})
