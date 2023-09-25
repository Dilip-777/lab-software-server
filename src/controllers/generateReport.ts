import { Request, Response } from "express";
import path from "path";
import puppeteer from "puppeteer";

// const img = require("../images/bgimage.png")

// const puppeteer = require('puppeteer');

// Your Express route handler to generate the PDF using Puppeteer
export const generateReport =  async  (req: Request, res: Response) => {
  const tableHTML = req.body.html; // Assuming the HTML code is sent from the client

//    const headerImagePath = path.join(__dirname, "../images/header_image.jpg");

  try {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setContent(tableHTML);
    // await (await browser.newPage()).setContent(tableHTML);

    
    
    // You may want to adjust the page dimensions and layout based on your table's size
     await page.pdf({
        path: 'generated_table.pdf',
      format: 'A4',
      landscape: false,
      printBackground: true,
      margin: {
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
      },
      
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: ` <div>
    
    <div style="margin-top: 8rem; padding-bottom; 5rem;z-index: 1000; background-image: url('http://localhost:5000/images/reportbg.png');">
    
    <div style="display: flex; justify-content: space-between; ">
            <div style="display: flex; flex-direction: column;">
                <p style="font-size: 15px; font-weight: bolder;margin:3px;">${
                 " patient.nameprefix" + " " + "patient.name"
                }</p>
                <p style="font-size: 14px;margin: 2px;"><strong>Age : </strong>${
                  "patient.age" + " " + "patient.agesuffix"
                }</p>
                <p style="font-size: 14px; margin: 2px;"><strong>Sex : </strong>${
                  "patient.gender"
                }</p>
                <p style="font-size: 14px;margin:2px;"><strong>PID : </strong>${
                  "patient.id"
                }</p>
            </div>
            <div style="border-left: 1.5px solid black;  margin-left: 1rem; height: 6rem;"></div>
            <div style="display: flex; flex-direction: column; justify-self: flex-start;">
                <p style="font-size: 14px;margin:1px;">
                  <strong> Sample Collected At:</strong> <br>
            Krupanidhi book stall,</p>
            <p style="font-size: 14px;margin:1px;margin-top: 5px;">Ref. By: <strong>skldfjslf</strong></p>
                </p>
            </div>
             <div style="border-left: 1.5px solid black;  margin-left: 1rem; height: 6rem;"></div>
              <div style="display: flex; flex-direction: column;">
                <p style="font-size: 12px;margin:1px;">
                   Registered On: <br>
                   11:18 AM 15 Aug, 23<br>
                   Collected on:<br>
                   11:43 AM 15 Aug, 23<br>
                   Reported on:<br>
                   12:11 PM 15 Aug, 23
                </p>
            </div>
        </div>
    </div></div>`,
      footerTemplate: `<div style="display: flex; justify-content: space-between; margin-top: 1rem;background-color: red;">`
    });
//     await page.pdf({
// path: 'generated_table.pdf',
//  format: "A4",

//  displayHeaderFooter:true,
 
// headerTemplate:"<div style=' font-size: 28px; width:100%; -webkit-print-color-adjust: exact;height:180px; min-height: 69px;overflow: auto;clear: both;border-bottom: 1px solid #ddd;background: red;' >Header</div>", 

// footerTemplate:"<div style=' font-size: 28px;  width:100%; -webkit-print-color-adjust: exact;height:180px; min-height: 69px;overflow: auto;clear: both;border-bottom: 1px solid #ddd;background: red;'> Footer</div>", 

// printBackground : true, 

// preferCSSPageSize:false,

// margin : {top: 0, bottom: 0, left: 0, right: 0
// } 
// } ); 

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(path.resolve('generated_table.pdf'));
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to generate PDF');
  }
};
