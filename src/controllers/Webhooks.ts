import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../services/stripe";
import { saveSubscription } from "../useCases/saveSubscription";

const relevantEvents = new Set([
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export class WebhooksController {
  public async handle(request: Request, response: Response): Promise<Response> {
    // @ts-ignore
    const sig = request.headers["stripe-signature"];

    if (!sig) {
      return response.status(401);
    }
    // stripe

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err) {
      // @ts-ignore
      console.log("ERROR event.type", err.message);
      // @ts-ignore
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }
    const { type } = event;
    console.log("event.type", event.type);
    if (relevantEvents.has(type)) {
      try {
        // Handle the event
        switch (event.type) {
          case "customer.subscription.updated":
          case "customer.subscription.deleted":
            const subscription = event.data.object as Stripe.Subscription;
            await saveSubscription(
              subscription.id.toString(),
              subscription.customer.toString()
            );
            break;
          default:
            throw new Error(`Unhandled event type ${event.type}`);
        }
      } catch (error) {
        return response.json({ error: "Webhook handler failed." });
      }

      return response.json({ received: true });
    }

    // Return a 200 response to acknowledge receipt of the event
    return response.status(200).send();
  }
}
