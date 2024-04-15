// Importing bcrypt library for password hashing and hashPassword function from crypt module
import bcrypt from 'bcrypt';
import hashPassword from '../helpers/crypt.mjs';

// Mocking bcrypt library methods
jest.mock('bcrypt', () => ({
    genSaltSync: jest.fn(),
    hashSync: jest.fn()
}));

// Describe block for testing the hash function
describe('Test the hash function', () => {
    // Test case for correct function calls with correct parameters
    it('Test for correct function calls with correct params', () => {
        // Call hashPassword function with a test password
        hashPassword('test');

        // Expectations for genSaltSync method being called with salt rounds and hashSync method being called
        expect(bcrypt.genSaltSync).toHaveBeenCalledWith(10);
        expect(bcrypt.hashSync).toHaveBeenCalled();
    });
});
