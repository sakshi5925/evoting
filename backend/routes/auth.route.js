import router from "express";
import { loginUser, registerUser } from "../controllers/Auth.controller.js";

const authRouter = router.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);

export default authRouter;