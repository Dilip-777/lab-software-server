import express from "express";
import { addPriceList, deletePriceList, getPriceList, getPriceListLabels, getPriceLists, updatePriceList } from "../controllers/pricelist";

const pricelistRouter = express.Router();

pricelistRouter.get("/getPricelist", getPriceLists);

pricelistRouter.get("/labels", getPriceListLabels)

pricelistRouter.get("/getPricelist/:id", getPriceList);

pricelistRouter.post("/add", addPriceList);

pricelistRouter.put("/update/", updatePriceList);

pricelistRouter.delete("/delete/:id", deletePriceList);

export default pricelistRouter;
