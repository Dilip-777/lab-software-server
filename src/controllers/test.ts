import { Request, Response } from "express";
import prisma from "../util/prisma";


export const getTests = async (req: Request, res: Response) => {
    try {
        const tests = await prisma.test.findMany()
        res.status(200).json({ message: "success", data: tests })
    }
    catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}

export const getTest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const test = await prisma.test.findUnique({
            where: { id: Number(id) }
        })
        const references = await prisma.reference.findMany({
            where: { testId: Number(id) }
        })
        res.status(200).json({ message: "success", data: { test, references } })
    } catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}

export const addTest = async (req: Request, res: Response) => {
    try {
        const {testdata, referencedata} = req.body;

        const test = await prisma.test.create({
            data: testdata
        })
        const references = referencedata.map((reference: any) => ({testId: test.id, ...reference}))
         await prisma.reference.createMany({
            data: references,
            skipDuplicates: true
        })
        res.status(200).json({ message: "success", data: test })
    }
    catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}


export const updateTest = async (req: Request, res: Response) => {
    try {
        const {testdata, referencedata} = req.body;
        const { id } = req.params;
        const test = await prisma.test.update({
            where: { id: parseInt(id as string) },
            data: testdata
        })
        await prisma.reference.deleteMany({
            where: { testId: parseInt(id as string) }
        })
        const references = referencedata.map((reference: any) => ({testId: test.id, ...reference}))
        await prisma.reference.createMany({
            data: references,
            skipDuplicates: true
        })
        res.status(200).json({ message: "success", data: test })
    }
    catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}

export const deleteTest = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const test = await prisma.test.delete({
            where: { id: data.id }
        })
        res.status(200).json({ message: "success", data: test })
    }
    catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}

export const getPackagesTestsPricelists = async (req: Request, res: Response) => {
    try {
        const packages = await prisma.package.findMany({
            include: {
                pricelist: true,
                test: true, 
                profile : {
                    include: {
                        test: true
                    }
                }
        }})
        const profiles = await prisma.profile.findMany({
            include: {
                pricelist: true,
                test: true
            }

        })
        const tests = await prisma.test.findMany({
            include: {
                pricelist: true
            }
        })
        res.status(200).json({ message: "success", data: [...tests, ...profiles, ...packages] })
    } 
    catch(err) {
        res.status(500).json({ message: "failure", err })
    }
}