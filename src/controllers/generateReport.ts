import { Request, Response } from 'express';
import path from 'path';
import puppeteer from 'puppeteer';
import { imagestr } from './basecode';
import moment from 'moment';

export const generateReport = async (req: Request, res: Response) => {
  const { html: tableHTML, patient, order, letterhead } = req.body;

  console.log(moment(order.orderDate).format('lll'), order);

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(tableHTML);

    await page.pdf({
      path: 'generated_table.pdf',
      format: 'A4',
      landscape: false,
      printBackground: true,
      margin: {
        top: '250',
        bottom: '120',
        left: '30',
        right: '30',
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
        </style> <div style="width: 100%;margin-top: -15px; padding-left: 30px; padding-right: 30px; padding-top: 100px;background-image: url('data:image/png;base64,${
          letterhead && imagestr
        }');background-size: 100%; background-repeat: repeat; height: 100vh; z-index: 100000;"> <div style="display: flex; justify-content: space-between; ">
       
            <div style="display: flex; flex-direction: column;">
                <p style="font-size: 12px; font-weight: bolder;margin:3px; background-color; red; max-width: 170px;">${
                  patient.nameprefix + ' ' + patient.name
                }</p>
                <p style="font-size:11px;margin: 2px;"><strong>Age : </strong>${
                  patient.age + ' ' + patient.agesuffix
                }</p>
                <p style="font-size:11px; margin: 2px;"><strong>Sex : </strong>${patient.gender}</p>
                <p style="font-size:11px;margin:2px;"><strong>PID : </strong>${patient.id}</p>
            </div>
            <div style="display: flex;">
            <div style="border-left: 1px solid black;  margin-right: 10px; height: 80px;"></div>
            <div style="display: flex; flex-direction: column; justify-self: flex-start;">
                <p style="font-size:11px;margin:1px;">
                  <strong> Sample Collected At:</strong> <br>
            </p>
             <p style="font-size:11px;margin:1px;">Nellore</p>
            <p style="font-size:11px;margin:1px;margin-top: 5px;">Ref. By: <strong>${
              order.lab?.diagonsticname || order.doctor?.doctorname || 'Self'
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
                    ${moment(order.orderDate).format('lll') || ''}
                   </p>
                 <p style="font-size: 9px;margin:1px;">
                   Collected on:
                   </p>
                 <p style="font-size: 9px;margin:1px;">
                   ${moment(order.collectiontime).format('lll') || ''}
                   </p>
                 <p style="font-size: 9px;margin:1px;">
                   Reported on:
                   </p>
                 <p style="font-size: 9px;margin:1px;">
                    ${moment(order.reporttime).format('lll') || ''}
                   </p>
                
              
            </div>
            </div>
            <div style="border-top: 0.5px solid black;border-width:0.5px; margin-top: 7px; width: 100%;"></div>
        </div>
        </div>
       `,
      footerTemplate: `<div style="display: flex; justify-content: space-between; margin-top: 1rem;background-color: red;">`,
    });

    await browser.close();

    res.setHeader('Content-Disposition', 'attachment; filename="desired_filename.pdf"');
    res.contentType('application/pdf');
    res.sendFile(path.resolve('generated_table.pdf'));
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to generate PDF');
  }
};
