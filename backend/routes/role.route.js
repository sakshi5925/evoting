import { Router } from "express";
import { AssignRole,removeRole,checkRoles } from "../controllers/Roles.controller.js";

const roleRouter = Router();

roleRouter.post("/assign", AssignRole);
roleRouter.post("/remove", removeRole);
roleRouter.post("/check", checkRoles);

export default roleRouter;

