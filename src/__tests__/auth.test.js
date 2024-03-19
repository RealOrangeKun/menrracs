import { verify, login, logout, checkLoggedIn, register } from "../controllers/auth.controller.mjs";
import bcrypt from 'bcrypt'
import hashPassword from "../controllers/crypt.mjs";
import User from "../models/user.schema.mjs";
jest.mock('../models/user.schema', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        create: jest.fn()
    }
}))
jest.mock('../controllers/crypt', () => ({
    __esModule: true,
    default: jest.fn()
}))
jest.mock('bcrypt', () => ({
    compareSync: jest.fn()
}))

describe('register tests', () => {
    it('successfull register', async () => {
        const req = {
            user: null, body: {
                username: 'test',
                password: 'testpwd',
                email: 'test@example.com'
            }
        }, res = {
            status: jest.fn(() => res),
            send: jest.fn(() => res),
            json: jest.fn()
        }
        await register(req, res)
        expect(hashPassword).toHaveBeenCalled()
        expect(User.create).toHaveBeenCalledWith(req.body)
        expect(res.status).toHaveBeenCalledWith(201)
    })
    it('failed resgisteration when user already logged in', async () => {
        const req = {
            user: {
                username: 'test',
                password: 'testpwd',
                email: 'test@example.com'
            }, body: {
                username: 'test',
                password: 'testpwd',
                email: 'test@example.com'
            }
        }, res = {
            status: jest.fn(() => res),
            send: jest.fn(() => res),
            json: jest.fn()
        }
        await register(req, res)
        expect(hashPassword).not.toHaveBeenCalled()
    }),
        it('failed registeration when user already exists in database', async () => {
            const req = {
                user: null, body: {
                    username: 'test',
                    password: 'testpwd',
                    email: 'test@example.com'
                }
            }, res = {
                status: jest.fn(() => res),
                send: jest.fn(() => res),
                json: jest.fn()
            }
            const findOneSpy = jest.spyOn(User, 'findOne')
            findOneSpy.mockReturnValue(req.body)
            await register(req, res)
            expect(hashPassword).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(400)
        })
})


describe('verify tests', () => {
    it('successfull verify test', async () => {
        const username = 'test', password = 'testpwd', done = jest.fn((error, user) => user)
        const findOneSpy = jest.spyOn(User, 'findOne'), compareSyncSpy = jest.spyOn(bcrypt, 'compareSync')
        compareSyncSpy.mockReturnValue(true)
        findOneSpy.mockReturnValue({ username: username, password: password })
        await verify(username, password, done)
        expect(done).toHaveBeenCalledWith(null, { username, password })
    }),
        it('failed verify user doesnt exist test', async () => {
            const username = 'test', password = 'testpwd', done = jest.fn((error, user) => user), findOneSpy = jest.spyOn(User, 'findOne')
            findOneSpy.mockReturnValue(null)
            await verify(username, password, done)
            expect(done).toHaveBeenCalledWith(new Error("User not found"), null)
        }),
        it('failed very wrong password test', async () => {
            const username = 'test', password = 'testpwd', done = jest.fn((error, user) => user),
                findOneSpy = jest.spyOn(User, 'findOne'), compareSyncSpy = jest.spyOn(bcrypt, 'compareSync');
            compareSyncSpy.mockReturnValue(false)
            findOneSpy.mockReturnValue({ username: username, password: password })
            await verify(username, password, done)
            expect(done).toHaveBeenCalledWith(new Error("Password is incorrect"), null)
        })

})

describe('checking if user already logged in tests', () => {
    it('user is already logged in test', () => {
        const req = { user: { test: 'test' } }, res = { status: jest.fn(() => res), json: jest.fn() }
        checkLoggedIn(req, res)
        expect(res.status).toHaveBeenCalledWith(403)
    }),
        it('user is not logged in test', () => {
            const req = { user: null }, res = {}, next = jest.fn()
            checkLoggedIn(req, res, next)
            expect(next).toHaveBeenCalled()
        })
})

describe('logout tests', () => {
    it('logout successfull test', () => {
        const req = { user: { test: 'test' }, logout: jest.fn(), session: { destroy: jest.fn() } }, res = { status: jest.fn(() => res), json: jest.fn(), sendStatus: jest.fn() }
        logout(req, res)
        expect(req.logout).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalledWith(401)
    }),
        it('logout failed test', () => {
            const req = { user: null, logout: jest.fn(), session: { destroy: jest.fn() } }, res = { status: jest.fn(() => res), json: jest.fn(), sendStatus: jest.fn() }
            logout(req, res)
            expect(req.logout).not.toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(401)
        })
})