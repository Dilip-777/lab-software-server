import express from 'express';
import { addTest, deleteTest, getPackagesTestsPricelists, getTest, getTests, updateTest } from '../controllers/test';

const testRouter = express.Router();

testRouter.get('/getTests', getTests);

testRouter.get('/getTest/:id', getTest);

testRouter.post('/add', addTest);

testRouter.put('/update/:id', updateTest);

testRouter.delete('/delete/:id', deleteTest);

testRouter.get('/getpackagespricelist', getPackagesTestsPricelists);

export default testRouter;
