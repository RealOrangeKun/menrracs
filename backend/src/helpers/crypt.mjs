// Import bcrypt library for password hashing
import bcrypt from 'bcrypt';

// Define the number of salt rounds for password hashing
const saltRounds = 10;

/**
 * @description Hashes password by using `bcrypt.hashsync` function
 * @param {String} password 
 * @returns 
 */
export default function hashPassword(password) {
    // Generate a salt with the specified number of rounds
    const salt = bcrypt.genSaltSync(saltRounds);
    // Hash the password using the generated salt
    return bcrypt.hashSync(password, salt);
}