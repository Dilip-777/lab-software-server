import { Request, Response } from "express";
import prisma from "../util/prisma";
import { Test } from "@prisma/client";

export const getPatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id: Number(id) },
      include: {
        orders: {
          orderBy: {
            orderDate: "desc",
          },
          include: {
            tests: {
                      include: {
                        test: {
                          include: {
                            referencesValues: true,
                          },
                        },
                      }
                    },
            doctor: true,
            lab: true,
            profiles: {
              include: {
                tests: {
                      include: {
                        test: {
                          include: {
                            referencesValues: true,
                          },
                        },
                      }
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
                      }
                },
                profiles: {
                  include: {
                    tests: {
                      include: {
                        test: {
                          include: {
                            referencesValues: true,
                          },
                        },
                      }
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    res.status(200).json({ message: "success", data: patient });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};

export const getPatients = async (req: Request, res: Response) => {
  try {
    const patients = await prisma.patient.findMany();
    res.status(200).json({ message: "success", data: patients });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};

export const addPatient = async (req: Request, res: Response) => {
  // try {
  const data = req.body;


  let patient

  if(!data.patient) {
    patient = await prisma.patient.create({
      data: {
        name: data.name,
        age: data.age,
        emailId: data.emailId,
        gender: data.gender,
        phonenumber: data.phonenumber,
        address: data.address,
        agesuffix: data.agesuffix,
        identityNumber: data.identityNumber,
        identityType: data.identityType,
        nameprefix: data.nameprefix,
      },
    });
  } else {
    patient = data.patient
  }

   const order =  await prisma.order.create({
      data: {
        patientId: patient.id,
        balanceamount: data.balanceamount,
        discount: data.discount,
        netamount: data.netamount,
        orderDate: data.orderDate,
        paidamount: data.paidamount,
        paymentmethod: data.paymentmethod,
        totalamount: data.totalamount,
        bill: data.bill,
        discountType: data.discountType,
        doctorId: data.doctorId,
        labId: data.labId,
      },
    });

    data.packages?.map(async (packageData: any) => {
      const price = packageData?.pricelist?.find((p: any) => p.label === data.pricelist)?.price || 0;
       const p = await prisma.orderPackage.create({
          data: {
            orderId: order.id,
            name: packageData.name,
            price: price,
            note: packageData.note,
            reportwithin: packageData.reportwithin,
            samplesize: packageData.samplesize,
            sampletype: packageData.sampletype,
            sampleunit: packageData.sampleunit,
            tests: {
            createMany: {
              data: packageData.test.map((test: Test) => ({
                
                name: test.name,
                price: test.regularprice,
                note: test.note,
                reportwithin: test.reportwithin,
                samplesize: test.samplesize,
                sampletype: test.sampletype,
                sampleunit: test.sampleunit,
                testId: test.id
            }))
            }
          }
          }
        })

        packageData.profile.map(async(profile: any) => {
        await  prisma.orderProfile.create({
            data: {
              packageId: p.id,
              name: profile.name,
              price: profile.price,
              note: profile.note,
              reportwithin: profile.reportwithin,
              samplesize: profile.samplesize,
              sampletype: profile.sampletype,
              sampleunit: profile.sampleunit,
              tests: {
                createMany: {
                  data: profile.test.map((test: Test) => ({
                   name: test.name,
              price: test.regularprice,
              note: test.note,
              reportwithin: test.reportwithin,
              samplesize: test.samplesize,
              sampletype: test.sampletype,
              sampleunit: test.sampleunit,
              testId: test.id
                }))
                }
              }
            }
          })
        })
    })
   if(data.profiles) {
    const price = data.profiles?.pricelist?.find((p: any) => p.label === data.pricelist)?.price || 0;
   await  req.body.profiles.forEach(async (profileData: any) => {
       await prisma.orderProfile.create({
        data: {
          orderId: order.id,
          name: profileData.name,
          price: price,
          note: profileData.note,
          reportwithin: profileData.reportwithin,
          samplesize: profileData.samplesize,
          sampletype: profileData.sampletype,
          sampleunit: profileData.sampleunit,
          tests: {
            createMany: {
              data: profileData.test.map((test: Test) => ({
                
                name: test.name,
                price: test.regularprice,
                note: test.note,
                reportwithin: test.reportwithin,
                samplesize: test.samplesize,
                sampletype: test.sampletype,
                sampleunit: test.sampleunit,
                testId: test.id
            }))
            }
          }
        }
      })
    }) 
  } 

    await prisma.orderTest.createMany({
      data: data.tests.map((test: any) => {
        const price = test.pricelist?.find((p: any) => p.label === data.pricelist)?.price || 0;
        return ({
        orderId: order.id,
        name: test.name,
        price: price,
        note: test.note,
        reportwithin: test.reportwithin,
        samplesize: test.samplesize,
        sampletype: test.sampletype,
        sampleunit: test.sampleunit,
        testId: test.id
      })
      })
    })

  
  // const patient = await prisma.patient.create({
  //     data: data
  // })
  res.status(200).json({ message: "success" });
  // }
  // catch (error) {
  //     res.status(500).json({ message: "failure", error })
  // }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const { id } = req.params;
    const patient = await prisma.patient.update({
      where: { id: parseInt(id as string) },
      data: data,
    });
    res.status(200).json({ message: "success", data: patient });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const patient = await prisma.patient.delete({
      where: { id: parseInt(id as string) },
    });
    res.status(200).json({ message: "success", data: patient });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
};
