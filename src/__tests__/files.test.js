// Importing necessary modules
import path from 'path'; // Importing path module for handling file paths
import fs, { readdirSync } from 'fs'; // Importing fs module for file system operations
import { getFile, uploadFiles, deleteFiles, updateFile } from '../controllers/files.controller.mjs'; // Importing functions from the files controller module

// Mocking file system modules
jest.mock('fs');
jest.mock('path')

// Testing getFile function
describe('getFile function', () => {
    // Setting up request and response objects
    const req = { query: {} };
    const res = {
        status: jest.fn(() => res),
        json: jest.fn()
    };

    // Testing scenario: should return 404 if file not found
    it('should return 404 if file not found', () => {
        req.query.name = 'nonexistentFile.txt';
        getFile(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, error: "File not found" });
    });

    // Testing scenario: file found, res.download should be called
    it('file found res.download should be called', () => {
        res.download = jest.fn();
        req.query.name = 'testfile.txt';
        const existsSyncSpy = jest.spyOn(fs, 'existsSync');
        existsSyncSpy.mockReturnValue(true);
        getFile(req, res);
        expect(res.download).toHaveBeenCalled();
    })

    // Testing scenario: name parameter not provided and read directory
    it('name parameter not provided and read dir', async () => {
        req.query.name = null;
        const readdirSyncMock = jest.spyOn(fs, 'readdirSync');
        readdirSyncMock.mockReturnValue(['testfile1.txt', 'testfile2.txt']); // Mocking readdirSync to return file list
        jest.spyOn(path, 'join').mockImplementation(() => process.cwd() + '/processed/');
        await getFile(req, res);
        expect(fs.readdir).toHaveBeenCalled();
        expect(fs.readdir).not.toThrow();
    });
});

// Testing uploadFiles function
describe('uploadFiles function', () => {
    // Setting up request and response objects
    const req = {
        files: [
            { originalname: 'file1.txt', path: '/tmp/file1.txt' },
            { originalname: 'file2.txt', path: '/tmp/file2.txt' }
        ],
        user: { id: 'userId', username: 'testuser' }
    };
    const res = {
        status: jest.fn(() => res),
        json: jest.fn()
    };

    // Testing scenario: should handle case where no files provided
    it('should handle case where no files provided', () => {
        req.files = undefined;
        uploadFiles(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, error: "No file/files provided in the form body" });
    });

});

// Testing deleteFiles function
describe('deleteFiles function', () => {
    // Setting up request and response objects
    const req = { user: { id: 'userId', username: 'testuser' }, query: {} };
    const res = {
        status: jest.fn(() => res),
        json: jest.fn()
    };

    // Testing scenario: should handle case where no files provided
    it('should handle case where no files provided', async () => {
        deleteFiles(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, error: "No files provided or invalid format" });
    });


});

// Testing updateFile function
describe('updateFile function', () => {
    // Setting up request and response objects
    const req = {
        user: { id: 'userId', username: 'testuser' },
        file: { originalname: 'file1.txt', path: '/tmp/file1.txt' },
        query: { name: 'file1.txt' }
    };
    const res = {
        status: jest.fn(() => res),
        json: jest.fn()
    };

    // Testing scenario: should handle case where name or file not provided
    it('should handle case where name or file not provided', async () => {
        req.query.name = undefined;
        updateFile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, error: "No files provided or invalid format" });
    });


});
