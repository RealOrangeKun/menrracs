// Import cron to create the tasks
import cron from 'node-cron';
// Import User to edit the User collection
import User from "../models/user.schema.mjs";
// Import mongoose to connect to db
import mongoose from 'mongoose';
// Import the google cloud storage bucker
import { bucket } from '../constants/filesConstants.mjs';
// Import the sendEmail func to send emails to users
import { sendEmail } from '../helpers/sendMail.mjs';

/**
 * @description
 * The function responsible for cleaning the inactive users.
 * 
 * Function loops through the users in mongodb and finds one with a
 * last login from 6 months ago and deletes them.
 */
const cleanUnactiveUsers = async () => {
    try {
        const inactiveTime = 6 * 30 * 24 * 60 * 60 * 1000; // 6 Months
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
/**
 * @description
 * The function responsible for emailing users about the
 * account deletion.
 * 
 * Function loops through the users in mongodb and finds one with a
 * last login from 5 months and 2 weeks ago and emails them.
 */
const notifyUser = async () => {
    try {
        const inactiveTime = 14369280000; // 5 Months and 2 Weeks
        const inactiveUsers = await User.find({ lastLogin: { $lt: new Date(Date.now() - inactiveTime) } });
        inactiveUsers.forEach(async user => {
            await sendEmail(user.email, process.env.MAIL_PASS, "Your account hasn't been logged into for almost a year now and will be deleted after 2 weeks. " +
                "If you dont want it to be deleted please login in to your account.", 'Inactive Account Removal');
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
