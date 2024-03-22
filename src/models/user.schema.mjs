// Import necessary modules from mongoose
import { model, Schema } from 'mongoose';
import { fileSchema } from './file.schema.mjs';


// Define the schema for the user collection
const userSchema = new Schema({
    // Define schema for the username field
    username: {
        // Define the field type as String
        type: String,
        // Username is required, with custom error message
        required: [true, 'Username is required.'],
        // Minimum length for username, with custom error message
        minlength: [3, 'Username must be at least 3 characters long.'],
        // Maximum length for username, with custom error message
        maxlength: [50, 'Username cannot exceed 50 characters.'],
        // Ensure username is unique, with custom error message
        unique: {
            value: true,
            message: 'Username already exists'
        }
    },
    // Define schema for the email field
    email: {
        // Define the field type as String
        type: String,
        // Email is required, with custom error message
        required: [true, 'Email is required.'],
        // Minimum length for email, with custom error message
        minlength: [5, 'Email must be at least 5 characters long.'],
        // Maximum length for email, with custom error message
        maxlength: [100, 'Email cannot exceed 100 characters.'],
        // Ensure email is unique, with custom error message
        unique: {
            value: true,
            message: 'Email is already taken'
        },
        // Validate email format using regex, with custom error message
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.'],
    },
    // Define schema for the password field
    password: {
        // Define the field type as String
        type: String,
        // Password is required, with custom error message
        required: [true, 'Password is required.'],
        // Minimum length for password, with custom error message
        minlength: [8, 'Password must be at least 8 characters long.'],
        // Maximum length for password, with custom error message
        maxlength: [100, 'Password cannot exceed 100 characters.'],
        // Validate password complexity using regex, with custom error message
        validate: {
            // Custom validator function to check password complexity
            validator: function (value) {
                return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(value);
            },
            // Error message for password validation failure
            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.'
        }
    },
    files: {
        type: [fileSchema],
        default: []
    }
}, {
    // Enable timestamps for created and updated fields
    timestamps: true
});

// Create a model for the User schema
const User = model('User', userSchema);

// Export the User model
export default User;
