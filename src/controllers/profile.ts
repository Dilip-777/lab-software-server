import { Request, Response } from "express";
import prisma from "../util/prisma";

export const getProfiles = async (req: Request, res: Response) => {
  try {
    const profiles = await prisma.profile.findMany({
      include: { test: true, formulas: true },
    });
    res.status(200).json({ message: "success", data: profiles });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await prisma.profile.findUnique({
      where: { id: Number(id) },
      include: {
        test: true,
        headings: {
          include: {
            tests: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        formulas: {
          include: { references: true },
        },
      },
    });
    res.status(200).json({ message: "success", data: { profile } });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};

export const addProfile = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    console.log(data);
    const profile = await prisma.profile.create({
      data: {
        test: {
          connect: data.tests.map((test: any) => ({ id: test })),
        },
        ...data.profiledata,
      },
    });

    await Promise.all(
      await data.headings.map(async (heading: any) => {
        await prisma.headings.create({
          data: {
            heading: heading.heading,
            order: heading.order,
            tests: {
              connect: heading.tests.map((test: any) => ({ id: test.id })),
            },
            profileId: profile.id,
          },
        });
      })
    );

    await Promise.all(
      data.formulas.map(async (formula: any) => {
        if (formula.id) {
          const references = await prisma.formulas.findUnique({
            where: {
              id: formula.id,
            },
            include: {
              references: true,
            },
          });

          await prisma.formulas.update({
            where: { id: formula.id },
            data: {
              references: {
                disconnect: references?.references.map((reference: any) => ({
                  id: reference.id,
                })),
                connect: formula.references.map((reference: any) => ({
                  id: reference.id,
                })),
              },
              ...formula.formuladata,
            },
          });
        } else {
          await prisma.formulas.create({
            data: {
              references: {
                connect:
                  formula.references?.map((reference: any) => ({
                    id: reference.id,
                  })) || [],
              },
              ...formula,
            },
          });
        }
      })
    );

    res.status(200).json({ message: "success", data: profile });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  // try {
  const data = req.body;
  const { id } = req.params;
  const tests = await prisma.profile.findUnique({
    where: {
      id: parseInt(id as string),
    },
    include: {
      test: true,
    },
  });

  const profile = await prisma.profile.update({
    where: { id: parseInt(id as string) },
    data: {
      test: {
        disconnect: tests?.test.map((test: any) => ({ id: test.id })),
        connect: data.tests.map((test: any) => ({ id: test.id })),
      },
      ...data.profiledata,
    },
  });

  await prisma.headings.deleteMany({
    where: {
      profileId: parseInt(id as string),
    },
  });

  await Promise.all(
    await data.headings.map(async (heading: any) => {
      await prisma.headings.create({
        data: {
          heading: heading.heading,
          order: heading.order,
          tests: {
            connect: heading.tests.map((test: any) => ({ id: test.id })),
          },
          profileId: profile.id,
        },
      });
    })
  );

  await Promise.all(
    data.formulas.map(async (formula: any) => {
      const f = await prisma.formulas.findFirst({
        where: {
          testId: formula.testId,
          profileId: formula.profileId,
        },
        include: {
          references: true,
        },
      });

      if (f) {
        const references = await prisma.formulas.findUnique({
          where: {
            id: f.id,
          },
          include: {
            references: true,
          },
        });

        await prisma.formulas.update({
          where: { id: f.id },
          data: {
            references: {
              disconnect:
                references?.references.map((reference: any) => ({
                  id: reference.id,
                })) || [],
              connect:
                formula.references?.map((reference: any) => ({
                  id: reference.id,
                })) || [],
            },
            ...formula,
          },
        });
      } else {
        await prisma.formulas.create({
          data: {
            references: {
              connect:
                formula.references?.map((reference: any) => ({
                  id: reference.id,
                })) || [],
            },
            ...formula,
          },
        });
      }
    })
  );
  res.status(200).json({ message: "success", data: profile });
  // }
  // catch (error) {
  //     res.status(500).json({ message: "failure", error })
  // }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await prisma.profile.delete({
      where: { id: parseInt(id as string) },
    });
    res.status(200).json({ message: "success", data: profile });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};
