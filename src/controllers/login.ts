import { Request, Response } from "express";
import prisma from "../util/prisma"
import jwt from 'jsonwebtoken';


export const login = async (req: Request, res: Response) => {
   const { username, password } = req.body;
   const user = await prisma.user.findUnique({  
        where: {
            username: username
        }
    })
    if(!user) return res.status(400).json({message: "Username does not exist"})

    if(user.password !== password) return res.status(400).json({message: "Password is incorrect"})

     const token = jwt.sign(user, process.env.secretKey || "", { expiresIn: '1h' });

     res.status(200).json({token: token, user: user})

}