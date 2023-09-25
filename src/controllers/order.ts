import { Request, Response } from "express";
import prisma from "../util/prisma";

export const getOrders = async (req: Request, res: Response) => {
  try {
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
        patient: true,
        tests: {
          include: {
            test : {
              include: {
                referencesValues : true
              }
            }
          }
        },
        packages: {
          include: {
            tests: {
              include: {
                test: {
                  include: {
                    referencesValues : true
                  }
                },
              }
            },
            profiles: {
              include: {
                tests: {
              include: {
                test: {
                  include: {
                    referencesValues : true
                  }
                },
              }
            },

            }
          },

        }},
        profiles: {
          include: {
            tests: {
              include: {
                test: {
                  include: {
                    referencesValues : true
                  }
                },
              }
            },
          }
        }
        ,
        doctor: true,
        lab: true,
      },
      orderBy: {
        orderDate: "desc"
      }
    });
    res.status(200).json({ message: "success", data: orders });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }

};


export const orderStatusChange = async (req: Request, res: Response) => {
   const { id, orderstatus } = req.body;
   await prisma.order.update({
    where: {
      id: id
    },
    data: {
      orderstatus: orderstatus,
    }
   })
    res.status(200).json({ message: "success" })
}

export const editOrderTests = async (req: Request, res: Response) => {
  const { tests } = req.body;
  console.log(tests);
  
  await tests.forEach(async (test: any) => {
     await prisma.orderTest.update({
      where: {
        id: test.id
      },
      data: test
     })
  })

 const orders = await prisma.order.findMany({
    where: {
      orderstatus: {
        not: "Test Completed"
      },
      packages: {
        every: {
          tests: {
            every: {
              observedValue: {
                not: null
              }
            }
          }, 
          profiles: {
            every: {
              tests: {
                every: {
                  observedValue: {
                    not: null
                  }
                }
              }
            }
          }
        }
      },
      profiles: {
        every: {
              tests: {
                every: {
                  observedValue: {
                    not: null
                  }
                }
              }
            }
      },
      tests: {
        every: {
          observedValue: {
            not: null
          }
        }
      }
    }
  })


  if(orders.length > 0) {
    await prisma.order.updateMany({
      where: {
        id: {
          in: orders.map((order: any) => order.id)
        }
      },
      data: {
        orderstatus: "Test Completed"
      }
    })
  }





  res.status(200).json({ message: "success" })
}


