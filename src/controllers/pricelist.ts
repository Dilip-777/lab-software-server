import { Request, Response } from "express";
import prisma from "../util/prisma";
import { PriceList } from "@prisma/client";


export const getPriceLists = async (req: Request, res: Response) => {
    const { type } = req.query;

    try {
          const headers = await prisma.priceList.findMany({
                select: { label: true },
                distinct: ["label"]
            })
        if(type === "Test") {

            const tests = await prisma.test.findMany({
                include: { pricelist: true }
            })
            res.status(200).json({ message: "success", data: {tests, headers} })
        } else if(type === "Profile") {
            const profiles = await prisma.profile.findMany({
                include: { pricelist: true }
            })
            res.status(200).json({ message: "success", data: {profiles, headers} })
        } else if(type === "Package") {
            const packages = await prisma.package.findMany({
                include: { pricelist: true }
            })
            res.status(200).json({ message: "success", data: {packages, headers} })
        } else {
            res.status(400).json({ message: "failure", error: "Invalid type" })
        }
    }
    catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}

export const getPriceListLabels = async (req: Request, res: Response) => {
    try {
        const headers = await prisma.priceList.findMany({
            select: { label: true },
            distinct: ["label"]
        })
        res.status(200).json({ message: "success", data: headers })
    }
    catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}

export const getPriceList = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const test = await prisma.test.findUnique({
            where: { id: Number(id) }
        })
        // const headers = await prisma.priceList.findMany({

        // })
        res.status(200).json({ message: "success", data: { test } })
    } catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}

export const addPriceList = async (req: Request, res: Response) => {
    // try {
        const isExist = await prisma.priceList.findFirst({
            where: { label: req.body.label }
        })
        if(isExist) {
            res.status(400).json({ message: "failure", error: "Label already exists" })
            return;
        }
        const data = req.body;
        if(data.type === "Test") {
        
        const pricelist = await prisma.priceList.create({
            data: {
                label: data.label,
                price: data.price,
                test: {
                    connect: { id: parseInt(data.testId) }
                }
            }
        })
    } else if(data.type === "Profile") {
        const pricelist = await prisma.priceList.create({
            data: {
                label: data.label,
                price: data.price,
                profile: {
                    connect: { id: parseInt(data.testId) }
                }
            }
        })
    } else if(data.type === "Package") {
        const pricelist = await prisma.priceList.create({
            data: {
                label: data.label,
                price: data.price,
                package: {
                    connect: { id: parseInt(data.testId) }
                }
            }
        })
    }
        res.status(200).json({ message: "success" })
    // }
    // catch (error) {
    //     res.status(500).json({ message: "failure", error })
    // }
}


export const updatePriceList = async (req: Request, res: Response) => {
    try {
        const testData = req.body
       for (const data of testData) {
    const { test, labelsAndPrices, type } = data;
    

    // const test = await prisma.test.findUnique({
    //   where: { id: testId },
    //   include: { pricelist: true },
    // });

    const existingPrices = test?.pricelist ?? [];

    for (const [label, price] of Object.entries(labelsAndPrices)) {
      const existingPrice = existingPrices.find((p: PriceList) => p.label === label);
      

      if (existingPrice) {
        if(type === "Test") {
            await prisma.priceList.update({
                where: { id: existingPrice.id },
                data: { price: price as number },
            });
        } else if(type === "Profile") {
            await prisma.priceList.update({
                where: { id: existingPrice.id },
                data: { price: price as number },
            });
        } else if(type === "Package") {
            await prisma.priceList.update({
                where: { id: existingPrice.id },
                data: { price: price as number },
            });
        }
        } else {
            if(type === "Test") {
                await prisma.priceList.create({
                    data: { label, price: price as number, testId: test?.id },
                });
            } else if(type === "Profile") {
                await prisma.priceList.create({
                    data: { label, price: price as number, profileId: test?.id },
                });
            } else if(type === "Package") {
                await prisma.priceList.create({
                    data: { label, price: price as number, packageId: test?.id },
                });
            }
      }
    }
  }
        res.status(200).json({ message: "success" })
    }
    catch (error) {
        res.status(500).json({ message: "failure", error })
    }
}

export const deletePriceList = async (req: Request, res: Response) => {
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