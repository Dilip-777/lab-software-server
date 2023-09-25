import express from "express"
import { addRefDoctor, deleteRefDoctor, getRefDoctor, getRefDoctors, updateRefDoctor } from "../controllers/refDoctor";


const refDoctorRouter = express.Router();


refDoctorRouter.get("/getrefdoctors", getRefDoctors )

refDoctorRouter.get("/getrefdoctor/:id", getRefDoctor )

refDoctorRouter.post("/add", addRefDoctor )


refDoctorRouter.put("/edit", updateRefDoctor)


refDoctorRouter.delete("/delete", deleteRefDoctor)


export default refDoctorRouter;