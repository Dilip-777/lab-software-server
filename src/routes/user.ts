import express from "express"
import { getUsers, usercreation, userdelete, userupdate } from "../controllers/user";


const userRouter = express.Router();


userRouter.get("/getUsers", getUsers )

userRouter.post("/add", usercreation )


userRouter.put("/edit", userupdate)


userRouter.delete("/delete", userdelete)


export default userRouter;