// Import bcrypt library for password hashing
import bcrypt from 'bcrypt';

// Define the number of salt rounds for password hashing
const saltRounds = 10;

// Function to hash a password
export default function hashPassword(password) {
    // Generate a salt with the specified number of rounds
    const salt = bcrypt.genSaltSync(saltRounds);
    // Hash the password using the generated salt
    return bcrypt.hashSync(password, salt);
}
