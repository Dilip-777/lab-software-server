import { Request, Response } from "express";
import path from "path";
import puppeteer from "puppeteer";
import { imagestr } from "./basecode";
import moment from "moment";
import prisma from "../util/prisma";
import fs from "fs";
import QRCode from "qrcode";

export const generateReport = async (req: Request, res: Response) => {
  const { html: tableHTML, patient, order, letterhead } = req.body;

  const settings = await prisma.printSetting.findFirst();

  const imgStr: string | null =
    (await getImgStr(
      path.join(__dirname, "..", "uploadedFiles", settings?.letterhead || "")
    )) || imagestr;

  // try {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(tableHTML);

  const qrCodeBuffer = await generateQRCode(
    "http://localhost:5000/pdf?orderId=" + order.id + "&patientId=" + patient.id
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
                  patient.nameprefix + " " + patient.name
                }</p>
                <p style="font-size:11px;margin: 2px;margin-left: 0px;"><strong>Age : </strong>${
                  patient.age + " " + patient.agesuffix
                }</p>
                <p style="font-size:11px; margin: 2px;margin-left: 0px;"><strong>Sex : </strong>${
                  patient.gender
                }</p>
                <p style="font-size:11px;margin:2px;margin-left: 0;"><strong>PID : </strong>${
                  patient.id
                }</p>
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
              order.lab?.diagonsticname || order.doctor?.doctorname || "Self"
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
                    ${moment(order.orderDate).format("lll") || ""}
                   </p>
                 <p style="font-size: 9px;margin:1px;">
                   Collected on:
                   </p>
                 <p style="font-size: 9px;margin:1px;">
                   ${moment(order.collectiontime).format("lll") || ""}
                   </p>
                 <p style="font-size: 9px;margin:1px;">
                   Reported on:
                   </p>
                 <p style="font-size: 9px;margin:1px;">
                    ${moment(order.reporttime).format("lll") || ""}
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
    'attachment; filename="desired_filename.pdf"'
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
    // const chunkSize = 200; // Adjust the chunk size as needed
    // const chunks = [];
    // for (let i = 0; i < data.length; i += chunkSize) {
    //   chunks.push(data.slice(i, i + chunkSize));
    // }

    // const qrCodes = await Promise.all(
    //   chunks.map((chunk) => QRCode.toBuffer(chunk))
    // );
    // const combinedBuffer = Buffer.concat(qrCodes);
    const qrCodeBuffer = await QRCode.toBuffer(data);
    // return combinedBuffer.toString("base64");
    return qrCodeBuffer.toString("base64");
  } catch (error) {
    console.error("Error generating QR Code:", error);
    throw error;
  }
}

function getImgStr(filePath: string) {
  try {
    const data = fs.readFileSync(filePath);
    // Check if the file is an image
    // if (!isValidImage(data)) {
    //   throw new Error("Invalid image format");
    // }
    // Encode the image data to base64 string
    const imgStr = Buffer.from(data).toString("base64");
    return imgStr;
  } catch (error) {
    console.error(error);
    return null;
  }
}
