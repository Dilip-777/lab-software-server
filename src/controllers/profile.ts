import { Request, Response } from "express";
import prisma from "../util/prisma";


export const getProfiles = async (req: Request, res: Response) => {
    try {
        const profiles = await prisma.profile.findMany({
            include: { test: true }
        })
        res.status(200).json({ message: "success", data: profiles })
    }
    catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}

export const getProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const profile = await prisma.profile.findUnique({
            where: { id: Number(id) }, 
            include: { test: true }
        })
        res.status(200).json({ message: "success", data: { profile,  } })
    } catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}

export const addProfile = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        console.log(data);
        const profile = await prisma.profile.create({
            data: {
                test: {
                    connect: data.tests.map((test: any) => ({ id: test })),
                },
                ...data.profiledata  
            }
        })

        res.status(200).json({ message: "success", data: profile })
    }
    catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}


export const updateProfile = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const { id } = req.params;
        const tests = await prisma.profile.findUnique({
            where: {
                id: parseInt(id as string)
            },
            include: {
                test: true
            }
        })
        
        const profile = await prisma.profile.update({
            where: { id: parseInt(id as string) },
            data: {
                test: {
                    disconnect: tests?.test.map((test: any) => ({ id: test.id })),
                    connect: data.tests.map((test: any) => ({ id: test.id })),
                },
                ...data.profiledata
            }
        })
        res.status(200).json({ message: "success", data: profile })
    }
    catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}

export const deleteProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const profile = await prisma.profile.delete({
            where: { id: parseInt(id as string) }
        })
        res.status(200).json({ message: "success", data: profile })
    }
    catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}