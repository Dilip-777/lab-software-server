import { Request, Response } from "express";
import path from "path";
import puppeteer from "puppeteer";
import { imagestr } from "./basecode";
import moment from "moment";
import prisma from "../util/prisma";
import fs from "fs";
import QRCode from "qrcode";
import { generateReportHtml } from "../utils/generateReport";

export const pdfwithqr = async (req: Request, res: Response) => {
  const { patientId, orderId } = req.query;

  const settings = await prisma.printSetting.findFirst({
    include: {
      signs: true,
    },
  });

  const orderedPackages = await prisma.orderPackage.findMany({
    where: {
      orderId: Number(orderId as string),
    },
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
  });

  const orderedTests = await prisma.orderTest.findMany({
    where: {
      orderId: Number(orderId as string),
    },
    include: {
      test: {
        include: {
          referencesValues: true,
        },
      },
    },
  });

  const orderedProfiles = await prisma.orderProfile.findMany({
    where: {
      orderId: Number(orderId as string),
    },
    include: {
      profile: true,
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
    },
  });

  const departments = await prisma.department.findMany({
    orderBy: {
      order: "desc",
    },
  });

  let data1: {
    packages: any[];
    profiles: any[];
    tests: any[];
    name: string;
  }[] = [];

  if (settings?.departmentwise) {
    departments.forEach((d) => {
      const packs = orderedPackages.filter(
        (p) =>
          p?.profiles.find((p) => p.profile?.departmentId === d.id) ||
          p?.tests.find((p) => p.test?.departmentId === d.id)
      );
      const profiles = orderedProfiles.filter(
        (p) => p?.profile?.departmentId === d.id
      );
      const tests = orderedTests.filter((p) => p.test.departmentId === d.id);
      if ([...packs, ...profiles, ...tests].length > 0) {
        data1.push({ packages: packs, profiles, tests, name: d.name });
      }
    });
    const packs = orderedPackages;
    const profiles = orderedProfiles.filter((p) => !p?.profile?.departmentId);
    const tests = orderedTests.filter((p) => !p.test.departmentId);
    if ([...packs, ...profiles, ...tests].length > 0)
      data1.push({
        packages: packs,
        profiles: profiles,
        tests: tests,
        name: "",
      });
  } else {
    data1.push({
      packages: orderedPackages,
      profiles: orderedProfiles,
      tests: orderedTests,
      name: "",
    });
  }

  const patient = await prisma.patient?.findUnique({
    where: {
      id: Number(patientId as string),
    },
  });

  const order = await prisma.order?.findUnique({
    where: {
      id: Number(orderId as string),
    },
    include: {
      lab: true,
      doctor: true,
    },
  });

  const html = generateReportHtml({
    departments: [],
    departmentwise: data1,
    patient: patient,
    printSetting: settings,
  });

  const imgStr: string | null =
    (await getImgStr(
      path.join(__dirname, "..", "uploadedFiles", settings?.letterhead || "")
    )) || imagestr;

  // try {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html as string);

  const qrCodeBuffer = await generateQRCode(
    "http://localhost:5000/pdf?orderId=" +
      order?.id +
      "&patientId=" +
      patient?.id
  );

  await page.pdf({
    path: "generated_table.pdf",
    format: "A4",
    landscape: false,
    printBackground: true,
    margin: {
      top: 197 + (settings?.topmargin ?? 100),
      bottom: settings?.bottommargin || 144,
      left: settings?.leftmargin || 30,
      right: "0",
    },
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: `<style>
        html {
          -webkit-print-color-adjust: exact;
        }
        body{
          margin: 0;
          padding: 0;
        }
        </style> <div style="width: 100%;position: relative;margin-top: -15px; padding-left: ${settings?.leftmargin}px; padding-right: ${settings?.rightmargin}px; padding-top: ${settings?.topmargin}px;background-image: url('data:image/png;base64,${
          settings?.letterhead && imgStr ? imgStr : ""
        }');background-size: 100%; background-repeat: repeat; height: 100vh; z-index: 1000;"> <div style="display: flex; justify-content: space-between; ">
        <div style="display: flex; ">
            <div style="display: flex; flex-direction: column;position: relative;">
                <p style="font-size: 12px; font-weight: bolder;margin:3px;margin-left: 0; background-color; red; max-width: 170px;">${
                  patient?.nameprefix + " " + patient?.name
                }</p>
                <p style="font-size:11px;margin: 2px;margin-left: 0px;"><strong>Age : </strong>${
                  patient?.age + " " + patient?.agesuffix
                }</p>
                <p style="font-size:11px; margin: 2px;margin-left: 0px;"><strong>Sex : </strong>${patient?.gender}</p>
                <p style="font-size:11px;margin:2px;margin-left: 0;"><strong>PID : </strong>${patient?.id}</p>
                </div>
                </div>
                <div style="display: flex;">
              ${
                !settings?.disableqrcode
                  ? ""
                  : `<img src="data:image/png;base64,${qrCodeBuffer}" style="width: 50px; height: 50px;right: 0; align-self:center;margin-right:0;"/>`
              }
            <div style="border-left: 1px solid black;  margin-right: 10px; height: 80px;"></div>
            <div style="display: flex; flex-direction: column; justify-self: flex-start;">
                <p style="font-size:11px;margin:1px;">
                  <strong> Sample Collected At:</strong> <br>
            </p>
             <p style="font-size:11px;margin:1px;">Nellore</p>
            <p style="font-size:11px;margin:1px;margin-top: 5px;">Ref. By: <strong>${
              order?.lab?.diagonsticname || order?.doctor?.doctorname || "Self"
            }</strong></p>
                </p>
            </div>
            </div>
             <div style="border-left: 1px solid black;  margin-left: 10px; height: 80px;"></div>
              <div style="display: flex; flex-direction: column; align-items: flex-end;">
                 <p style="font-size: 9px;margin:1px;">
                   Registered On: <br>
                   </p>
                 <p style="font-size: 9px;margin:1px;">
                    ${
                      moment(order?.orderDate).format("MMM DD, YYYY hh:mm A") ||
                      ""
                    }
                   </p>
                 <p style="font-size: 9px;margin:1px;">
                   Collected on:
                   </p>
                 <p style="font-size: 9px;margin:1px;">
                   ${
                     moment(order?.collectiontime).format(
                       "MMM DD, YYYY hh:mm A"
                     ) || ""
                   }
                   </p>
                 <p style="font-size: 9px;margin:1px;">
                   Reported on:
                   </p>
                 <p style="font-size: 9px;margin:1px;">
                    ${
                      moment(order?.reporttime).format(
                        "MMM DD, YYYY hh:mm A"
                      ) || ""
                    }
                   </p>
                
              
            </div>
            </div>
            <div style="border-top: 0.5px solid black;border-width:0.5px; margin-top: 7px; margin-bottom:3px; width: 100%;"></div>
           
            <div style="display: grid;
  grid-template-columns: repeat(11, 1fr);grid-gap: 0px;
 width: 100%;font-weight: bold;padding-left: 0px;">
              <p style="font-size: 10px; grid-column: 1 / 5;width: 100%;">Investigation</p>
              <p style="font-size: 10px;grid-column: 5 / 7;width:100%;">Obtained Value</p>
              <p style="font-size: 10px;grid-column: 7 / 8;"></p>
              <p style="font-size: 10px;grid-column: 8 /9; ">Units</p>
              <p style="font-size: 10px;grid-column: 9 / 12;">Reference Intervals</p>
              <p>kk</p>
            </div>
        </div>
       
     
     </div>
       `,
    footerTemplate: settings?.pagenumber
      ? `
    <div style="border-top: solid 1px #bbb; width: 100%; font-size: 9px;z-index: 10000;
        padding: 5px 5px 0;padding-bottom: 83px;  position: relative;">
        <div style="position: absolute; right: 20px; top: 5px;">Page <span class="pageNumber"></span> of  <span class="totalPages"></span></div>
    </div>
  `
      : "",
  });

  await browser.close();

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${patient?.nameprefix + " " + patient?.name}.pdf"` //${patient?.nameprefix + " " + patient?.name}.pdf
  );
  res.contentType("application/pdf");
  res.sendFile(path.resolve("generated_table.pdf"));
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).send("Failed to generate PDF");
  // }
};

async function generateQRCode(data: any) {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(data);
    return qrCodeBuffer.toString("base64");
  } catch (error) {
    console.error("Error generating QR Code:", error);
    throw error;
  }
}

function getImgStr(filePath: string) {
  try {
    const data = fs.readFileSync(filePath);
    const imgStr = Buffer.from(data).toString("base64");
    return imgStr;
  } catch (error) {
    console.error(error);
    return null;
  }
}
