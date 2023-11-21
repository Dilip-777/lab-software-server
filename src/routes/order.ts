import express from "express";
import {
  deleteOrder,
  editOrderTests,
  getFormulasForOrder,
  getOrder,
  getOrders,
  orderEdit,
  orderStatus,
  orderStatusChange,
} from "../controllers/order";

const orderRouter = express.Router();

orderRouter.get("/getOrder/:id", getOrder);
orderRouter.get("/getOrders", getOrders);
orderRouter.put("/updateStatus", orderStatusChange);
orderRouter.put("/updateOrder", editOrderTests);
orderRouter.put("/editorder", orderEdit);
orderRouter.get("/getformulas", getFormulasForOrder);
orderRouter.get("/statuscomplete", orderStatus);
orderRouter.delete("/delete/:id", deleteOrder);

export default orderRouter;
