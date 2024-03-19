import { model, Schema } from 'mongoose';

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required.'],
        minlength: [3, 'Username must be at least 3 characters long.'],
        maxlength: [50, 'Username cannot exceed 50 characters.'],
        unique: {
            value: true,
            message: 'Username already exists'
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        minlength: [5, 'Email must be at least 5 characters long.'],
        maxlength: [100, 'Email cannot exceed 100 characters.'],
        unique: {
            value: true,
            message: 'Email is already taken'
        },
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.']
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
        minlength: [8, 'Password must be at least 8 characters long.'],
        maxlength: [100, 'Password cannot exceed 100 characters.'],
        validate: {
            validator: function (value) {
                return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(value);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.'
        }
    }
}, {
    timestamps: true
});

const User = model('User', userSchema);

export default User;
