// src/index.ts
import express, { Request } from 'express';
import https from 'https';

import cors from 'cors';
import roleRouter from './routes/role';
import bodyParser from 'body-parser';
import userRouter from './routes/user';
import departmentRouter from './routes/department';
import testRouter from './routes/test';
import profileRouter from './routes/profile';
// require('dotenv').config();
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import packageRouter from './routes/package';
import pricelistRouter from './routes/pricelist';
import refLabRouter from './routes/refLab';
import refDoctorRouter from './routes/getLabdoctor';
import multer from 'multer';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';
import patientRouter from './routes/patient';
import { generatepdf } from './controllers/generatepdf';
import orderRouter from './routes/order';
import { generateReport } from './controllers/generateReport';
import { createPdf } from './controllers/testreport';

dotenv.config();

const app = express();

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server Started Sucessfully!');
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploadedFiles', express.static(path.join(__dirname, 'uploadedFiles')));

// app.use("/",async (req, res) => {
//   const users = await prisma.user.findMany()
//   res.send(` hello world`)
// })
app.use('/auth', authRouter);
app.use('/role', roleRouter);
app.use('/user', userRouter);
app.use('/department', departmentRouter);
app.use('/test', testRouter);
app.use('/profile', profileRouter);
app.use('/package', packageRouter);
app.use('/pricelist', pricelistRouter);
app.use('/reflab', refLabRouter);
app.use('/refdoctor', refDoctorRouter);
app.use('/patient', patientRouter);
app.use('/order', orderRouter);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploadedFiles');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
var upload = multer({
  storage,
}).array('file');

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    const data = req.files;

    // const files: any[] = [];
    // for (let i in data) {
    //    files.push(data[i].filename);
    // }
    return res.status(200).send({ success: 'true', data });
  });
});

app.post('/generatepdf', generatepdf);
app.post('/generatereport', generateReport);
app.post('/test', createPdf);

app.post('/convertToPDF', (req, res) => {
  const apiKey = 'tXjd-qRXljjqopC9Ivvs'; // Replace with your DocRaptor API key

  const payload = JSON.stringify({
    user_credentials: apiKey,
    doc: {
      document_content: req.body.htmlContent, // HTML content from the request body
      name: 'output.pdf', // Specify the desired PDF file name
      document_type: 'pdf',
      test: true,
    },
  });

  const options = {
    hostname: 'docraptor.com',
    port: 443,
    path: '/docs',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
    },
  };

  const pdfRequest = https.request(options, (pdfResponse) => {
    if (pdfResponse.statusCode === 200) {
      pdfResponse.setEncoding('binary');
      let pdfData = '';
      pdfResponse.on('data', (chunk) => {
        pdfData += chunk;
      });
      pdfResponse.on('end', () => {
        // Save the generated PDF to a file or send it as a response to the client
        fs.writeFile('output.pdf', pdfData, 'binary');
      });
    } else {
      console.error('Document creation failed:', pdfResponse.statusCode);
      res.status(500).send('Error generating PDF');
    }
  });

  pdfRequest.on('error', (error) => {
    console.error('Error making request to DocRaptor:', error);
    res.status(500).send('Error generating PDF');
  });

  pdfRequest.end(payload, 'utf8');

  res.status(200).send('PDF generation started');
});

app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
