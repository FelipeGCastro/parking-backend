import { Router } from "express";
import { SpotsController } from "./controllers/SpotsController";

const routes = Router();

const spotsController = new SpotsController();

routes.get("/spots", spotsController.index);
routes.post("/spots", spotsController.create);
routes.patch("/spots", spotsController.update);

export default routes;
