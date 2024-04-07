import nodemailer from 'nodemailer'



export const sendDeletionEmail = async (userEmail, pass) => {
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'menrracs.noreply@gmail.com',
            pass: pass
        }
    })
    const options = {
        from: 'menrracs.noreply@gmail.com',
        to: userEmail,
        subject: 'Inactive Removal',
        text: "Your account hasn't been logged into for almost a year now and will be deleted after 2 weeks. " +
            "If you dont want it to be deleted please login in to your account."
    }
    try {
        const info = await transport.sendMail(options);
    } catch (error) {
        console.error(error.message);
    }

}