// Importing necessary modules
import User from "../models/user.schema.mjs"; // Importing the User model schema
import hashPassword from "../helpers/crypt.mjs"; // Importing the hashPassword function from the crypt controller
import { matchedData, validationResult } from "express-validator"; // Importing matchedData and validationResult from express-validator module
import { getProfile, updateProfile } from "../controllers/profile.controller.mjs"; // Importing functions from the profile controller module
import * as express_validator from 'express-validator'; // Importing express-validator module

// Mocking User model and express-validator module
jest.mock('../models/user.schema', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        updateOne: jest.fn()
    }
}));

jest.mock('express-validator', () => ({
    matchedData: jest.fn(),
    validationResult: jest.fn()
}));

// Testing scenarios for the getProfile function
describe('tests for the getProfile', () => {
    // Testing scenario: successful get request
    it('successfull get request', async () => {
        // Mocking request and response objects
        const req = {
            user: {
                id: 'test'
            }
        }, res = {
            status: jest.fn(() => res),
            json: jest.fn()
        };
        // Calling the getProfile function
        await getProfile(req, res);
        // Verifying the response status
        expect(res.status).toHaveBeenCalledWith(200);
    })

    // Testing scenario: failed get request
    it('failed get request', async () => {
        // Mocking request and response objects
        const req = {
            user: {
                id: 'test'
            }
        }, res = {
            status: jest.fn(() => res),
            json: jest.fn()
        };
        // Mocking the findOne method of the User model
        const findOneSpy = jest.spyOn(User, 'findOne');
        findOneSpy.mockImplementation(() => { throw new Error("Mongo test error") });
        // Calling the getProfile function
        await getProfile(req, res);
        // Verifying the response status
        expect(res.status).toHaveBeenCalledWith(500);
    })
})


// Testing scenarios for the updateProfile function
describe('tests for the update profile', () => {
    // Testing scenario: user entered info in the wrong format
    it('user entered info in the wrong', async () => {
        // Mocking request and response objects
        const req = {
            user: {
                id: 'test'
            }
        }, res = {
            status: jest.fn(() => res),
            json: jest.fn()
        }, result = {
            array: jest.fn()
        };
        // Mocking validationResult function
        const validationResultSpy = jest.spyOn(express_validator, 'validationResult')
        validationResultSpy.mockReturnValue({ isEmpty: jest.fn(() => false), array: jest.fn() })
        // Calling the updateProfile function
        await updateProfile(req, res);
        // Verifying the response status and JSON content
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, errors: result.array() });
    })

    // Testing scenario: empty query test
    it('empty query test', async () => {
        // Mocking request and response objects
        const req = {
            user: {
                id: 'test'
            }, query: {
                username: null,
                email: null,
                password: null
            }
        }, res = {
            status: jest.fn(() => res),
            json: jest.fn()
        }, result = {
            array: jest.fn()
        };
        // Mocking validationResult function
        const validationResultSpy = jest.spyOn(express_validator, 'validationResult')
        validationResultSpy.mockReturnValue({ isEmpty: jest.fn(() => true), array: jest.fn() })
        // Calling the updateProfile function
        await updateProfile(req, res);
        // Verifying the response status and JSON content
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, error: "Nothing was provided in the request query" });
    })



    // Testing scenario: user provided one info to change with no Database error
    it('user provided one info to change with no Database error', async () => {
        // Mocking request and response objects
        const req = {
            user: {
                id: 'test'
            }, query: {
                username: 'testuser',
                email: null,
                password: null
            }
        }, res = {
            status: jest.fn(() => res),
            json: jest.fn()
        }, result = {
            array: jest.fn()
        }, data = {
            username: 'testuser',
            password: null,
            email: null
        };
        // Mocking validationResult and matchedData functions
        const validationResultSpy = jest.spyOn(express_validator, 'validationResult'),
            matchedDataSpy = jest.spyOn(express_validator, 'matchedData');
        validationResultSpy.mockReturnValue({ isEmpty: jest.fn(() => true), array: jest.fn() });
        matchedDataSpy.mockReturnValue({ username: 'testuser', password: null, email: null });
        // Calling the updateProfile function
        await updateProfile(req, res);
        // Verifying the calls to updateOne and response status
        expect(User.updateOne).toHaveBeenCalledWith({ _id: req.user.id }, { $set: { username: data.username } });
        expect(User.updateOne).not.toHaveBeenCalledWith({ _id: req.user.id }, { $set: { password: data.password } });
        expect(User.updateOne).not.toHaveBeenCalledWith({ _id: req.user.id }, { $set: { email: data.email } });
        expect(res.status).toHaveBeenCalledWith(200);
    })

    // Testing scenario: database error test
    it('database error test', async () => {
        // Mocking request and response objects
        const req = {
            user: {
                id: 'test'
            }, query: {
                username: 'testuser',
                email: 'testpassword',
                password: 'testemail'
            }
        }, res = {
            status: jest.fn(() => res),
            json: jest.fn()
        }, result = {
            array: jest.fn()
        }, data = {
            username: 'testuser',
            password: 'testpassword',
            email: 'testemail'
        };
        // Spying on express-validator to mock some functions return values
        const validationResultSpy = jest.spyOn(express_validator, 'validationResult'),
            matchedDataSpy = jest.spyOn(express_validator, 'matchedData'), updateOneSpy = jest.spyOn(User, 'updateOne');
        validationResultSpy.mockReturnValue({ isEmpty: jest.fn(() => true), array: jest.fn() });
        matchedDataSpy.mockReturnValue({ username: 'testuser', password: 'testpassword', email: 'testemail' });
        // Mocking updateOne function to throw an error
        updateOneSpy.mockImplementation(() => { throw new Error("Mongo test error") });
        // Calling the updateProfile function
        await updateProfile(req, res);
        // Verifying the response status
        expect(res.status).toHaveBeenCalledWith(500);
    })
})
