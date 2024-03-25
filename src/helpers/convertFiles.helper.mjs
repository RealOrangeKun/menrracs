import ffmpeg from 'fluent-ffmpeg';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import csvtojson from 'csvtojson'


/**
 * 
 * @param {String} originalName 
 * @param {String} pathOriginal 
 */
export const convertFromPdfToDocx = async (file, originalName, pathOriginal, res) => {
    const newFileName = 'converted-' + originalName.replace(/\.[^.]+$/, ".docx");
    const newFilePath = path.join(process.cwd(), 'converted', newFileName);
    const pythonScriptPath = path.join(process.cwd(), 'src', 'pyscripts', 'pdfToDocx.py');
    const command = `python3 ${pythonScriptPath} ${pathOriginal} ${newFilePath}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error}`);
            return res.status(500).json({ success: false, error: "PDF to DOCX conversion failed" });
        }
        return res.status(200).download(newFilePath, newFileName, async (err) => {
            if (err) {
                await fs.unlink(file.path, (unlinkErr) => { });
                await fs.unlink(newFilePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error("Error while deleting file:", unlinkErr);
                    }
                });
                console.error("Download failed");
            } else {
                await fs.unlink(file.path, (unlinkErr) => { });
                await fs.unlink(newFilePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error("Error while deleting file:", unlinkErr);
                    }
                });
            }
        });
    });
}

export const convertUsingFFMPEG = async (pathOriginal, originalName, file, res, format) => {
    const newFileName = 'converted-' + originalName.replace(/\.[^.]+$/, '.' + format);
    const newFilePath = path.join(process.cwd(), 'converted', newFileName);
    ffmpeg(pathOriginal)
        .toFormat(format)
        .save(newFilePath)
        .on('end', async () => {
            res.download(newFilePath, newFileName, async (err) => {
                if (err) {
                    await fs.unlink(file.path, (unlinkErr) => { });
                    await fs.unlink(newFilePath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.error("Error while deleting file:", unlinkErr);
                        }
                    });
                } else {
                    await fs.unlink(file.path, (unlinkErr) => { });
                    await fs.unlink(newFilePath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.error("Error while deleting file:", unlinkErr);
                        }
                    });
                }
            });
        })
        .on('error', () => res.status(500).json({ success: false, error: "There was an issue while trying to convert" }));
}

export const convertFromCSVToJson = async (pathOriginal, originalName, file, res) => {
    const newFileName = 'converted-' + originalName.replace(/\.[^.]+$/, ".json");
    const newFilePath = path.join(process.cwd(), 'converted', newFileName);
    const json = await csvtojson().fromFile(pathOriginal);
    await fs.unlink(file.path, (unlinkErr) => { });
    return res.status(200).json(json)
}