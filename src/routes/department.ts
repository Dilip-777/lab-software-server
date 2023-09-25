import express from 'express';
import { addDepartment, deleteDepartment, getDepartment, getDepartments, updateDepartment } from '../controllers/department';


const departmentRouter = express.Router();

departmentRouter.get("/getDepartments",getDepartments)

departmentRouter.get("/getDepartment/:id",getDepartment)

departmentRouter.post("/add",addDepartment)

departmentRouter.put("/update/:id",updateDepartment)

departmentRouter.delete("/delete",deleteDepartment)

export default departmentRouter;