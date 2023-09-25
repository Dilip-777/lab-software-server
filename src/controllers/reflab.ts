import { Request, Response } from "express";
import prisma from "../util/prisma";


export const getReflabs = async (req: Request, res: Response) => {
    try{
        const users = await prisma.refLab.findMany();
        res.status(200).json({message: "success", data: users})  
    } catch(error) {
        res.status(500).json({message: "Something went wrong"})
    }
}

export const getRefLab = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const refLab = await prisma.refLab.findUnique({
            where: {
                id: parseInt(id as string)
            }
        });
        res.status(200).json({message: "success", data: refLab})
    } 
    catch(error) {
        res.status(500).json({message: "Something went wrong"})
    }
}


export const addRefLab = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const refLab = await  prisma.refLab.create({
            data: data
        })
        res.status(200).json({message: "Successs", data: refLab})
    } catch (error) {
        res.status(500).json({message: "Something went wrong"})
    }
}

export const updateRefLab = async (req: Request, res: Response) => {
    try {
        const {id, ...data} = req.body;
        const refLab = await prisma.refLab.update({
            where: {
                id: id
            },
            data: data
        })
        res.status(200).json({message: "Success", data: refLab})
    } catch (error) {
        res.status(500).json({message: "Something went wrong"})
    }
}

export const deleteRefLab = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const refLab = await prisma.refLab.delete({
            where: {
                id: id
            }
        })
        res.status(200).json({message: "Success", data: refLab})
    } catch (error) {
        res.status(500).json({message: "Something went wrong"})
    }
}