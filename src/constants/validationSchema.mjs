const createUserValidationSchema = {
    username: {
        isLength: {
            options: {
                min: 3,
                max: 50,
            },
            errorMessage: 'Username must be between 3 and 50 characters long.',
        },
        isString: {
            errorMessage: 'Username must be a string.',
        },
    },
    email: {
        isEmail: {
            errorMessage: 'Please enter a valid email address.',
        },
        isLength: {
            options: {
                min: 5,
                max: 100,
            },
            errorMessage: 'Email must be between 5 and 100 characters long.',
        },
    },
    password: {
        isLength: {
            options: {
                min: 8,
                max: 100,
            },
            errorMessage: 'Password must be between 8 and 100 characters long.',
        },
        custom: {
            options: (value, { req }) => {
                const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
                if (!regex.test(value)) {
                    throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
                }
                return true;
            },
        },
    },
};

export { createUserValidationSchema }