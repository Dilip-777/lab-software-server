import express from "express"
import { assignprivileges, getPrivileges, getRoles, rolecreation, roledelete, roleupdate } from "../controllers/role";

const roleRouter = express.Router();

roleRouter.get("/getroles", getRoles)

roleRouter.post("/add", rolecreation)

roleRouter.put("/edit", roleupdate)

roleRouter.delete("/delete", roledelete)

roleRouter.get("/getprivileges", getPrivileges)

roleRouter.post("/assignprivileges", assignprivileges)

export default roleRouter;