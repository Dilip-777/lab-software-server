import express from "express"
import { addRefLab, deleteRefLab, getRefLab, getReflabs, updateRefLab } from "../controllers/reflab";


const refLabRouter = express.Router();


refLabRouter.get("/getRefLabs", getReflabs )

refLabRouter.get("/getRefLab/:id", getRefLab )

refLabRouter.post("/add", addRefLab )


refLabRouter.put("/edit", updateRefLab)


refLabRouter.delete("/delete", deleteRefLab)


export default refLabRouter;