import { Router } from "express";
import { getProfile, updateProfile } from '../controllers/profile.controller.mjs'
import { checkSchema } from "express-validator";
import { createUserValidationSchema } from "../constants/validationSchema.mjs";

const router = Router();

router.get('/', getProfile)

router.put('/', checkSchema(createUserValidationSchema), updateProfile)

export default router;