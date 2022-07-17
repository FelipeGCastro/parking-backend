import { Router } from "express";
import { AuthenticateController } from "./controllers/Authenticate";
import { SpotsController } from "./controllers/Spots";
import { SubscriptionController } from "./controllers/Subscriptions";
import { WebhooksController } from "./controllers/Webhooks";
import express from "express";
import { StripeController } from "./controllers/Stripe";

const routes = Router();

const spotsController = new SpotsController();
const authController = new AuthenticateController();
const webhooksController = new WebhooksController();
const subscriptionsController = new SubscriptionController();
const stripeController = new StripeController();

routes.post("/authenticate", authController.handle);

// SPOTS
routes.get("/spots", spotsController.index);
routes.post("/spots", spotsController.create);
routes.patch("/spots", spotsController.update);

// STRIPE
routes.get("/stripe/key", stripeController.show);

// SUBSCRIPTIONS

routes.get("/subscription", subscriptionsController.show);
routes.post("/subscription/checkout", subscriptionsController.create);
routes.get("/prices", stripeController.index);

routes.post(
  "/webhooks",
  express.raw({ type: "application/json" }),
  webhooksController.handle
);

export default routes;
