import { Request, Response } from "express";
import prisma from "../util/prisma";

export const getOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await prisma.order.findUnique({
    where: {
      id: parseInt(id) || 0,
    },
    include: {
      patient: true,
      lab: true,
      doctor: true,
      tests: true,
      profiles: true,
      packages: true,
    },
  });

  res.status(200).json({ message: "success", data: order });
};

export const getOrders = async (req: Request, res: Response) => {
  // try {
  const {
    fromDate,
    toDate,
    patientname,
    testcode,
    testname,
    mobilenumber,
    refdoctor,
    reflab,
    status,
  } = req.query;

  let where: any = {};

  if (fromDate && toDate) {
    const nextDate = new Date(toDate as string);

    nextDate.setDate(nextDate.getDate() + 1);
    where.orderDate = {
      gte: new Date(fromDate as string),
      lte: nextDate,
    };
  }

  if (patientname) {
    where.patient = {
      name: {
        contains: patientname,
      },
    };
  }

  if (mobilenumber) {
    where.patient = {
      ...where.patient,
      phonenumber: {
        contains: mobilenumber,
      },
    };
  }

  if (testcode) {
    where.tests = {
      some: {
        testcode: {
          contains: testcode,
        },
      },
    };
  }

  if (testname) {
    where.tests = {
      ...where.tests,
      some: {
        ...where.tests?.some,
        name: {
          contains: testname,
        },
      },
    };
  }

  if (refdoctor) {
    where.doctor = {
      doctorname: {
        contains: refdoctor,
      },
    };
  }

  if (reflab) {
    where.lab = {
      diagonsticname: {
        contains: reflab,
      },
    };
  }

  if (status) {
    where.orderstatus = {
      contains: status,
    };
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      patient: {
        include: {
          orders: {
            take: 2,
          },
        },
      },
      tests: {
        include: {
          test: {
            include: {
              referencesValues: true,
            },
          },
        },
      },
      packages: {
        include: {
          tests: {
            include: {
              test: {
                include: {
                  referencesValues: true,
                },
              },
            },
          },
          profiles: {
            include: {
              headings: {
                include: {
                  tests: {
                    include: {
                      test: {
                        include: {
                          referencesValues: true,
                        },
                      },
                    },
                  },
                },
                orderBy: {
                  order: "asc",
                },
              },
              tests: {
                include: {
                  test: {
                    include: {
                      referencesValues: true,
                    },
                  },
                },
              },

              profile: {
                include: {
                  formulas: true,
                },
              },
            },
          },
        },
      },
      profiles: {
        include: {
          headings: {
            include: {
              tests: {
                include: {
                  test: {
                    include: {
                      referencesValues: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
          tests: {
            include: {
              test: {
                include: {
                  referencesValues: true,
                },
              },
            },
          },
          profile: {
            include: {
              formulas: true,
            },
          },
        },
      },
      doctor: true,
      lab: true,
    },
    orderBy: {
      orderDate: "desc",
    },
  });
  res.status(200).json({ message: "success", data: orders });
  // } catch (error) {
  //   res.status(500).json({ message: "failure", error });
  // }
};

export const orderStatusChange = async (req: Request, res: Response) => {
  const data = req.body;
  await prisma.order.update({
    where: {
      id: data.id,
    },
    data: data,
  });
  res.status(200).json({ message: "success" });
};

export const editOrderTests = async (req: Request, res: Response) => {
  const { tests } = req.body;
  console.log(tests);

  await Promise.all(
    tests.map(async (test: any) => {
      await prisma.orderTest.update({
        where: {
          id: test.id,
        },
        data: test,
      });
    })
  );

  // await tests.forEach(async (test: any) => {
  //   await prisma.orderTest.update({
  //     where: {
  //       id: test.id,
  //     },
  //     data: test,
  //   });
  // });

  res.status(200).json({ message: "success" });
};

export const orderStatus = async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: {
      orderstatus: {
        not: "Test Completed",
      },
      packages: {
        every: {
          tests: {
            every: {
              observedValue: {
                not: null,
              },
            },
          },
          profiles: {
            every: {
              tests: {
                every: {
                  observedValue: {
                    not: null,
                  },
                },
              },
            },
          },
        },
      },
      profiles: {
        every: {
          tests: {
            every: {
              observedValue: {
                not: null,
              },
            },
          },
        },
      },
      tests: {
        every: {
          observedValue: {
            not: null,
          },
        },
      },
    },
  });

  if (orders.length > 0) {
    await prisma.order.updateMany({
      where: {
        id: {
          in: orders.map((order: any) => order.id),
        },
      },
      data: {
        orderstatus: "Authorise",
      },
    });
  }

  res.status(200).json({ message: "success" });
};

export const orderEdit = async (req: Request, res: Response) => {
  const { data } = req.body;
  await prisma.order.update({
    where: {
      id: data.id,
    },
    data: {
      ...data,
    },
  });
  res.status(200).json({ message: "success" });
};

export const getFormulasForOrder = async (req: Request, res: Response) => {
  const { orderId } = req.query;

  const profileIds = await prisma.orderProfile.findMany({
    where: {
      OR: [
        {
          orderId: parseInt(orderId as string) || -1,
        },
        {
          package: {
            order: {
              id: parseInt(orderId as string) || -1,
            },
          },
        },
      ],
    },
  });

  //  const formulas = await prisma.formulas.findMany({
  //     where: {
  //       OR: [
  //         {
  //           profile: {
  //             orderprofile: {
  //               some: {
  //               orderId: parseInt(orderId as string) || -1
  //               },
  //             },
  //           },
  //         },
  //         {
  //           profile: {
  //             package: {
  //                 some: {
  //                   orderId: parseInt(orderId as string) || -1
  //                 }
  //             }
  //           }
  //         }
  //       ],
  //     },
  //   });
  const formulas = await prisma.formulas.findMany({
    where: {
      profileId: {
        in: profileIds.map((profile: any) => profile.profileId),
      },
    },
    include: {
      test: true,
    },
  });
  res.status(200).json({ message: "success", data: formulas, profileIds });
};

export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.order.delete({
    where: {
      id: parseInt(id as string) || 0,
    },
  });
  res.status(200).json({ message: "success" });
};
