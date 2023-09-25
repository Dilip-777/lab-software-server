import { Request, Response } from "express";
import prisma from "../util/prisma";


export const getPackages = async (req: Request, res: Response) => {
    try {
        const packages = await prisma.package.findMany({
            include: { test: true, profile: true }
        })
        res.status(200).json({ message: "success", data: packages })
    }
    catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}

export const getPackage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pack = await prisma.package.findUnique({
            where: { id: Number(id) }, 
            include: { test: true, profile: true }
        })
        res.status(200).json({ message: "success", data: { pack } })
    } catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}

export const addPackage = async (req: Request, res: Response) => {
    // try {
        const data = req.body;

        console.log(data);
        const pack = await prisma.package.create({
            data: {
                test: {
                    connect: data.tests.map((test: any) => ({ id: test.id })),
                },
                profile: {
                    connect: data.profiles.map((profile: any) => ({ id: profile.id })),
                },
                ...data.packagedata  
            }
        })

        res.status(200).json({ message: "success", data: pack })
    // }
    // catch (error) {
    //     res.status(500).json({ message: "failure", error })
    // }
}


export const updatePackage = async (req: Request, res: Response) => {
    // try {
        const data = req.body;
        const { id } = req.params;
        const tests = await prisma.test.findMany({
            where: {
                package: {
                    some: {
                        id: parseInt(id as string)
                    }
                }
            }
        })

        const profiles = await prisma.profile.findMany({
            where: {
                package: {
                    some: {
                        id: parseInt(id as string)
                    }
                }
            }
        })

        console.log(tests, data.tests);
        
        
        const pack = await prisma.package.update({
            where: { id: parseInt(id as string) },
            data: {
                test: {
                    disconnect: tests.map((test: any) => ({ id: test.id })),
                    connect: data.tests.map((test: any) => ({ id: test })),
                },
                profile: {
                    disconnect: profiles.map((profile: any) => ({ id: profile.id })),
                    connect: data.profiles.map((profile: any) => ({ id: profile })),
                },
                ...data.packagedata
            }
        })
        res.status(200).json({ message: "success", data: pack })
    // }
    // catch (error) {
    //     res.status(500).json({ message: "failure", error })
    // }
}

export const deletePackage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pack = await prisma.package.delete({
            where: { id: parseInt(id as string) }
        })
        res.status(200).json({ message: "success", data: pack })
    }
    catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}