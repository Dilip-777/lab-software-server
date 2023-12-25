import express from "express";
import {
  addSign,
  getPrintSetting,
  updatePrintSetting,
} from "../controllers/printsetting";

const PrintSettingRouter = express.Router();

PrintSettingRouter.get("/getSettings", getPrintSetting);
PrintSettingRouter.post("/save", updatePrintSetting);
PrintSettingRouter.post("/signs/add", addSign);

export default PrintSettingRouter;
