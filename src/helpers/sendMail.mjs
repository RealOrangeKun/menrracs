import nodemailer from 'nodemailer'



export const sendEmail = async (userEmail, pass, text, subject) => {
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'menrracs.noreply@gmail.com',
            pass
        }
    })
    const options = {
        from: 'menrracs.noreply@gmail.com',
        to: userEmail,
        subject: subject,
        text
    }
    try {
        const info = await transport.sendMail(options);
    } catch (error) {
        console.error(error.message);
    }

}