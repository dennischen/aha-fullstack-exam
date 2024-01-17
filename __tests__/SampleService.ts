export class SampleService {
    async getUser(id: number): Promise<{ id: number; name: string }> {
        // fetch user from database
        return { id: 100, name: 'Dennis Chen' }
    }
}