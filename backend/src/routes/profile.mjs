// Import Router to create a new Router
import { Router } from "express";
// Import the controller function
import { getProfile, updateProfile } from '../controllers/profile.controller.mjs';
// Import the checkSchema to check the user's input
import { checkSchema } from "express-validator";
// Import the validation schema
import { createUserValidationSchema } from "../constants/validationSchema.mjs";

// Create the router
const router = Router();

// Route for getting the user's profile details
router.get('/', getProfile)

// Route for updating the user's profile
router.put('/', checkSchema(createUserValidationSchema), updateProfile)

export default router;