import express from "express";
import { addProfile, deleteProfile, getProfile, getProfiles, updateProfile } from "../controllers/profile";

const profileRouter = express.Router();

profileRouter.get("/getProfiles", getProfiles);

profileRouter.get("/getProfile/:id", getProfile);

profileRouter.post("/add", addProfile);

profileRouter.put("/update/:id", updateProfile);

profileRouter.delete("/delete/:id", deleteProfile);

export default profileRouter;
