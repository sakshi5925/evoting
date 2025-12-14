import { Router } from "express";
import { AssignRole,removeRole,checkRoles,ElectionManagersList,getAllUsers } from "../controllers/Roles.controller.js";

const roleRouter = Router();

roleRouter.post("/assign", AssignRole);
roleRouter.post("/remove", removeRole);
roleRouter.get("/election-managers", ElectionManagersList);
roleRouter.post("/check", checkRoles);
roleRouter.get("/users", getAllUsers);

export default roleRouter;

