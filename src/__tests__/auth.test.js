// Import necessary modules and functions
import { verify, login, logout, checkLoggedIn, register } from "../controllers/auth.controller.mjs";
import bcrypt from 'bcrypt';
import hashPassword from "../helpers/crypt.mjs";
import User from "../models/user.schema.mjs";

// Mocking user schema, crypt module, and bcrypt library for testing
jest.mock('../models/user.schema', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        create: jest.fn()
    }
}));
jest.mock('../helpers/crypt', () => ({
    __esModule: true,
    default: jest.fn()
}));
jest.mock('bcrypt', () => ({
    compareSync: jest.fn()
}));

// Describe block for register tests
describe('register tests', () => {
    // Test case for successful registration
    it('successful register', async () => {
        // Mock request and response objects
        const req = {
            user: null,
            body: {
                username: 'test',
                password: 'testpwd',
                email: 'test@example.com'
            }
        };
        const res = {
            // Mock response methods
            status: jest.fn(() => res),
            send: jest.fn(() => res),
            json: jest.fn()
        };

        // Call register function with mock request and response
        await register(req, res);

        // Expectations for function calls and responses
        expect(hashPassword).toHaveBeenCalled();
        expect(User.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });

    // Test case for failed registration when user is already logged in
    it('failed registration when user already logged in', async () => {
        // Mock request and response objects with user already logged in
        const req = {
            user: {
                username: 'test',
                password: 'testpwd',
                email: 'test@example.com'
            },
            body: {
                username: 'test',
                password: 'testpwd',
                email: 'test@example.com'
            }
        };
        const res = {
            // Mock response methods
            status: jest.fn(() => res),
            send: jest.fn(() => res),
            json: jest.fn()
        };

        // Call register function with mock request and response
        await register(req, res);

        // Expectation for hashPassword function not being called
        expect(hashPassword).not.toHaveBeenCalled();
    });

    // Test case for failed registration when user already exists in database
    it('failed registration when user already exists in database', async () => {
        // Mock request and response objects
        const req = {
            user: null,
            body: {
                username: 'test',
                password: 'testpwd',
                email: 'test@example.com'
            }
        };
        const res = {
            // Mock response methods
            status: jest.fn(() => res),
            send: jest.fn(() => res),
            json: jest.fn()
        };

        // Spy on findOne method of User schema
        const findOneSpy = jest.spyOn(User, 'findOne');
        findOneSpy.mockReturnValue(req.body);

        // Call register function with mock request and response
        await register(req, res);

        // Expectations for function calls and responses
        expect(hashPassword).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// Describe block for verify tests
describe('verify tests', () => {
    // Test case for successful verification
    it('successful verify test', async () => {
        // Mock username, password, and done function
        const username = 'test';
        const password = 'testpwd';
        const done = jest.fn((error, user) => user);

        // Spy on findOne method of User schema and compareSync method of bcrypt
        const findOneSpy = jest.spyOn(User, 'findOne');
        const compareSyncSpy = jest.spyOn(bcrypt, 'compareSync');
        compareSyncSpy.mockReturnValue(true);
        findOneSpy.mockReturnValue({ username: username, password: password });

        // Call verify function with mock arguments
        await verify(username, password, done);

        // Expectation for done function being called with user object
        expect(done).toHaveBeenCalledWith(null, { username, password });
    });

    // Test case for failed verification when user doesn't exist
    it('failed verify user doesnt exist test', async () => {
        // Mock username, password, and done function
        const username = 'test';
        const password = 'testpwd';
        const done = jest.fn((error, user) => user);

        // Spy on findOne method of User schema
        const findOneSpy = jest.spyOn(User, 'findOne');
        findOneSpy.mockReturnValue(null);

        // Call verify function with mock arguments
        await verify(username, password, done);

        // Expectation for done function being called
        expect(done).toHaveBeenCalled();
    });

    // Test case for failed verification when password is incorrect
    it('failed verify wrong password test', async () => {
        // Mock username, password, and done function
        const username = 'test';
        const password = 'testpwd';
        const done = jest.fn((error, user) => user)
        // Spy on findOne method of User schema and compareSync method of bcrypt
        const findOneSpy = jest.spyOn(User, 'findOne');
        const compareSyncSpy = jest.spyOn(bcrypt, 'compareSync');
        compareSyncSpy.mockReturnValue(false);
        findOneSpy.mockReturnValue({ username: username, password: password });

        // Call verify function with mock arguments
        await verify(username, password, done);

        // Expectation for done function being called
        expect(done).toHaveBeenCalled();
    });
});

// Describe block for checking if user already logged in tests
describe('checking if user already logged in tests', () => {
    // Test case for user already logged in
    it('user is already logged in test', () => {
        // Mock request object with user already logged in and empty response object
        const req = { user: { test: 'test' } };
        const res = { status: jest.fn(() => res), json: jest.fn() };

        // Call checkLoggedIn function with mock request and response
        checkLoggedIn(req, res);

        // Expectation for status method being called with status code 403
        expect(res.status).toHaveBeenCalledWith(403);
    });

    // Test case for user not logged in
    it('user is not logged in test', () => {
        // Mock request object with user not logged in and empty response object
        const req = { user: null };
        const res = {};
        const next = jest.fn();

        // Call checkLoggedIn function with mock request, response, and next
        checkLoggedIn(req, res, next);

        // Expectation for next function being called
        expect(next).toHaveBeenCalled();
    });
});

// Describe block for logout tests
describe('logout tests', () => {
    // Test case for successful logout
    it('logout successful test', () => {
        // Mock request object with user logged in, and response and session objects with mock methods
        const req = { user: { test: 'test' }, logout: jest.fn(), session: { destroy: jest.fn() } };
        const res = { status: jest.fn(() => res), json: jest.fn(), sendStatus: jest.fn() };

        // Call logout function with mock request and response
        logout(req, res);

        // Expectations for logout and status methods not being called with status code 401
        expect(req.logout).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalledWith(401);
    });

    // Test case for failed logout
    it('logout failed test', () => {
        // Mock request object with user not logged in, and response and session objects with mock methods
        const req = { user: null, logout: jest.fn(), session: { destroy: jest.fn() } };
        const res = { status: jest.fn(() => res), json: jest.fn(), sendStatus: jest.fn() };

        // Call logout function with mock request and response
        logout(req, res);

        // Expectations for logout not being called and status method being called with status code 401
        expect(req.logout).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
    });
});
