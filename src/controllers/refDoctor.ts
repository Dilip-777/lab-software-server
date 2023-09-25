import { Request, Response } from "express";
import prisma from "../util/prisma";


export const getRefDoctors = async (req: Request, res: Response) => {
    try{
        const refDoctors = await prisma.refDoctor.findMany();
        res.status(200).json({message: "success", data: refDoctors})  
    } catch(error) {
        res.status(500).json({message: "Something went wrong"})
    }
}

export const getRefDoctor = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const refDoctor = await prisma.refDoctor.findUnique({
            where: {
                id: parseInt(id as string)
            }
        });
        res.status(200).json({message: "success", data: refDoctor})
    } 
    catch(error) {
        res.status(500).json({message: "Something went wrong"})
    }
}


export const addRefDoctor = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const refDoctor = await  prisma.refDoctor.create({
            data: data
        })
        res.status(200).json({message: "Successs", data: refDoctor})
    } catch (error) {
        res.status(500).json({message: "Something went wrong"})
    }
}

export const updateRefDoctor = async (req: Request, res: Response) => {
    try {
        const {id, ...data} = req.body;
        const refDoctor = await prisma.refDoctor.update({
            where: {
                id: id
            },
            data: data
        })
        res.status(200).json({message: "Success", data: refDoctor})
    } catch (error) {
        res.status(500).json({message: "Something went wrong"})
    }
}

export const deleteRefDoctor = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const refDoctor = await prisma.refDoctor.delete({
            where: {
                id: id
            }
        })
        res.status(200).json({message: "Success", data: refDoctor})
    } catch (error) {
        res.status(500).json({message: "Something went wrong"})
    }
}