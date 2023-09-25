import express from 'express';
import { editOrderTests, getOrders, orderStatusChange } from '../controllers/order';

const orderRouter = express.Router();

orderRouter.get("/getOrders",getOrders)
orderRouter.put("/updateStatus", orderStatusChange)
orderRouter.put("/updateOrder", editOrderTests)


export default orderRouter;