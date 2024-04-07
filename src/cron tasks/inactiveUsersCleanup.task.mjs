import cron from 'node-cron';
import User from "../models/user.schema.mjs";
import mongoose from 'mongoose';
import { bucket } from '../constants/filesConstants.mjs';
import { sendDeletionEmail } from '../controllers/sendMail.mjs';


const cleanUnactiveUsers = async () => {
    try {
        const inactiveTime = 6 * 30 * 24 * 60 * 60 * 1000;
        const inactiveUsers = await User.find({ lastLogin: { $lt: new Date(Date.now() - inactiveTime) } });
        const sessionsCollection = mongoose.connection.collection('sessions');
        const sessions = await sessionsCollection.find().toArray();
        inactiveUsers.forEach(async user => {
            const session = sessions.find(s => JSON.parse(s.session).passport.user === user._id.toString());
            if (session)
                sessionsCollection.deleteOne({ _id: session._id })
            await bucket.deleteFiles({
                prefix: `${user.username.toLowerCase()}`,
                force: true
            })
            await User.findByIdAndDelete(user._id)
        })
    } catch (error) {
        console.error(error.message);
    }
}

const notifyUser = async () => {
    try {
        const inactiveTime = 14369280000;
        const inactiveUsers = await User.find({ lastLogin: { $lt: new Date(Date.now() - inactiveTime) } });
        inactiveUsers.forEach(async user => {
            await sendDeletionEmail(user.email, process.env.MAIL_PASS);
        })
    } catch (error) {
        console.error(error.message);
    }
}

export const startCronJobs = () => {
    cron.schedule('0 0 * * *', async () => {
        await cleanUnactiveUsers();
    }),
        cron.schedule('0 0 * * *', async () => {
            await notifyUser();
        })
}
