import { Request, Response } from "express";
import prisma from "../util/prisma";



export const getRoles = async (req: Request, res: Response) => {
    const roles = await prisma.role.findMany();
    res.status(200).json({message: "Roles fetched successfully", data: roles})
}

export const  rolecreation = async (req: Request, res: Response) => {
    const { name } = req.body;

    const role = await  prisma.role.create({
        data: {
            name: name
        }
    })

    res.status(200).json({message: "Role created successfully", data: role})
} 

export const roleupdate = async (req: Request, res: Response) => {
    const { id, name } = req.body;

    const role = await prisma.role.update({
        where: {
            id: id
        },
        data: {
            name: name
        }
    })

    res.status(200).json({message: "Role updated successfully", data: role})
}

export const roledelete = async (req: Request, res: Response) => {
    const { id } = req.body;

    const role = await prisma.role.delete({
        where: {
            id: id
        }
    })

    res.status(200).json({message: "Role deleted successfully", data: role})
}

export const getPrivileges = async (req: Request, res: Response) => {
    const { roleid } = req.query;
    const privileges   = await prisma.privilege.findMany({
        where: {
            roleId: parseInt(roleid as string)
        }
    })
    res.status(200).json({message: "Privileges fetched successfully", data: privileges})
}

export const assignprivileges = async (req: Request, res: Response) => {
    const { roleid, privileges } = req.body;

    await prisma.privilege.deleteMany({
        where: {
            roleId: parseInt(roleid as string)
        }
    })

    
    
    const privilegesdata = privileges.map((privilege: string) => ({roleId: parseInt(roleid ),name : privilege }))
 
    const privilgesdata = await prisma.privilege.createMany({
        data: privilegesdata
    })

    

    res.status(200).json({message: "Privileges assigned successfully", data: privilgesdata})
}