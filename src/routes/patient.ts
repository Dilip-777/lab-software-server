import express from 'express';
import { addPatient, deletePatient, getPatient, getPatients, updatePatient } from '../controllers/patient';

const patientRouter = express.Router();

patientRouter.get("/getPatients",getPatients)

patientRouter.get("/getPatient/:id",getPatient)

patientRouter.post("/add",addPatient)

patientRouter.put("/update/:id",updatePatient)

patientRouter.delete("/delete",deletePatient)


export default patientRouter;