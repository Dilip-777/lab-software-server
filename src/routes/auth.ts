import express from 'express';
import { login } from '../controllers/login';

const authRouter = express.Router();

authRouter.post("/login", login )

export default authRouter;