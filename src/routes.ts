import { Router } from "express";
import { AuthenticateController } from "./controllers/Authenticate";
import { SpotsController } from "./controllers/SpotsController";

const routes = Router();

const spotsController = new SpotsController();
const authController = new AuthenticateController();

routes.post("/authenticate", authController.handle);
routes.get("/spots", spotsController.index);
routes.post("/spots", spotsController.create);
routes.patch("/spots", spotsController.update);

export default routes;
