import { Request, Response } from "express";
import prisma from "../util/prisma";

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        order: "desc",
      },
    });
    res.status(200).json({ message: "success", data: departments });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};

export const getDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const department = await prisma.department.findUnique({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: "success", data: department });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};

export const addDepartment = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const department = await prisma.department.create({
      data: data,
    });
    res.status(200).json({ message: "success", data: department });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const { id } = req.params;
    const department = await prisma.department.update({
      where: { id: parseInt(id as string) },
      data: data,
    });
    res.status(200).json({ message: "success", data: department });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const department = await prisma.department.delete({
      where: { id: data.id },
    });
    res.status(200).json({ message: "success", data: department });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};
