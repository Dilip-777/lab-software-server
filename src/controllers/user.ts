import { Request, Response } from "express";
import prisma from "../util/prisma";


export const getUsers = async (req: Request, res: Response) => {
    try{

        const users = await prisma.user.findMany();
        res.status(200).json({message: "Users fetched successfully", data: users})
        
    } catch(error) {
        res.status(500).json({message: "Something went wrong"})
    }
}


export const usercreation = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const user = await  prisma.user.create({
            data: {
                ...data
            }
        })
        res.status(200).json({message: "User created successfully", data: user})
    } catch (error) {
        res.status(500).json({message: "Something went wrong"})
    }
}

export const userupdate = async (req: Request, res: Response) => {
    try {
        const {id, ...data} = req.body;
        const user = await prisma.user.update({
            where: {
                id: id
            },
            data: data
        })
        res.status(200).json({message: "User updated successfully", data: user})
    } catch (error) {
        res.status(500).json({message: "Something went wrong"})
    }
}

export const userdelete = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const user = await prisma.user.delete({
            where: {
                id: id
            }
        })
        res.status(200).json({message: "User deleted successfully", data: user})
    } catch (error) {
        res.status(500).json({message: "Something went wrong"})
    }
}