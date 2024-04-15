// Import nodemailer to send the emails using SMTP protocol
import nodemailer from 'nodemailer'


/**
 * @description 
 * The function for sending emails
 * 
 * Function sends email to the user's email by using nodemailer Transport object and gmail
 * as its service
 * 
 * @param {String} userEmail 
 * @param {String} pass 
 * @param {String} text 
 * @param {String} subject
 * @see 
 */
export const sendEmail = async (userEmail, pass, text, subject) => {
    const transport = nodemailer.createTransport({
        // Service for sending the email
        service: 'gmail',
        auth: {
            // The email the api will use
            user: 'menrracs.noreply@gmail.com',
            // Auth password
            pass
        }
    })
    // Options object to pass to the transport object
    const options = {
        from: 'menrracs.noreply@gmail.com',
        to: userEmail,
        subject,
        text
    }
    // Send the mail
    try {
        await transport.sendMail(options);
    } catch (error) {
        console.error(error.message);
    }

}