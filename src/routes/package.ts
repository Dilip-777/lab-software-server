import express from "express";
import { addPackage, deletePackage, getPackage, getPackages, updatePackage } from "../controllers/package";

const packageRouter = express.Router();

packageRouter.get("/getPackages", getPackages);

packageRouter.get("/getPackage/:id", getPackage);

packageRouter.post("/add", addPackage);

packageRouter.put("/update/:id", updatePackage);

packageRouter.delete("/delete/:id", deletePackage);

export default packageRouter;
