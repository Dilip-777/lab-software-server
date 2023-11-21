
import { Request, Response } from "express"
// import Prince from "prince"

export const createPdf = (req: Request, res: Response) => {
    // Prince()
    //     .inputs('test.html')
    //     .output('test.pdf')
    //     .execute()
    //     .then(function () {
    //         console.log('OK: done');
            
    //         // Send the PDF file as a response
    //         res.status(200).sendFile('test.pdf', { root: __dirname });
    //     })
    //     .catch(function (error: any) {
    //         console.error('ERROR:', error);
    //         res.status(500).json({ error: 'An error occurred while generating the PDF.' });
    //     });
};

// Prince()
//     .inputs("test.html")
//     .output("test.pdf")
//     .execute()
//     .then(function () {
//         console.log("OK: done")
//     }, function (error: any) {
//         console.log("ERROR: ", "sldfkjsl")
//     })