import { Request, Response } from "express";
import path from "path";
import puppeteer from "puppeteer";

// const img = require("../images/bgimage.png")

// const puppeteer = require('puppeteer');

// Your Express route handler to generate the PDF using Puppeteer
export const generatepdf =  async  (req: Request, res: Response) => {
  const tableHTML = req.body.html; // Assuming the HTML code is sent from the client

//    const headerImagePath = path.join(__dirname, "../images/header_image.jpg");

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(tableHTML);
    await (await browser.newPage()).setContent(tableHTML);

    
    
    // You may want to adjust the page dimensions and layout based on your table's size
     await page.pdf({
        path: 'generated_table.pdf',
      format: 'A5',
      landscape: true,
      printBackground: true,
      margin: {
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
      },
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(path.resolve('generated_table.pdf'));
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to generate PDF');
  }
};
