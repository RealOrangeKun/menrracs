import bcrypt from 'bcrypt'
import hashPassword from '../controllers/crypt.mjs'
jest.mock('bcrypt', () => ({
    genSaltSync: jest.fn(),
    hashSync: jest.fn()
}))
describe('Test the hash function', () => {
    it('Test for correct function calls with correct params', () => {
        hashPassword('test')
        expect(bcrypt.genSaltSync).toHaveBeenCalledWith(10)
        expect(bcrypt.hashSync).toHaveBeenCalled()
    })
})