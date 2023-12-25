import { Request, Response } from "express";
import prisma from "../util/prisma";

export const getPrintSetting = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.printSetting.findFirst({
      include: {
        signs: true,
      },
    });
    res.status(200).json({ message: "success", settings });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};

export const updatePrintSetting = async (req: Request, res: Response) => {
  try {
    const { settings, departments } = req.body;
    await Promise.all(
      departments.map(async (department: any) => {
        await prisma.department.update({
          where: { id: department.id },
          data: {
            order: department.order,
          },
        });
      })
    );

    if (settings?.id) {
      const updatedSetting = await prisma.printSetting.update({
        where: { id: settings.id },
        data: settings,
      });
      res.status(200).json({ message: "success", settings: updatedSetting });
    } else {
      const { id, ...data } = settings;

      const newSetting = await prisma.printSetting.create({
        data,
      });
      res.status(200).json({ message: "success", settings: newSetting });
    }
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};

export const addSign = async (req: Request, res: Response) => {
  const { id, ...rest } = req.body;
  try {
    if (id) {
      await prisma.signs.update({
        where: { id },
        data: rest,
      });
      res.status(200).json({ message: "success" });
    } else {
      await prisma.signs.create({
        data: rest,
      });
      res.status(200).json({ message: "success" });
    }
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};
