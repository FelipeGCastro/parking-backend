import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { stripe } from "../services/stripe";
import { saveSubscription } from "../useCases/saveSubscription";

export class SubscriptionController {
  async show(request: Request, response: Response): Promise<Response> {
    // @ts-ignore
    const userId = request.userId;
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
    });
    if (!subscription) {
      return response.status(200).json({ error: "No Subscription" });
    }

    const subscriptionId = subscription.subscriptionId;
    const subs = await stripe.subscriptions.retrieve(subscriptionId);

    return response.status(200).json({ subscription: subs });
  }

  async create(request: Request, response: Response): Promise<Response> {
    const { priceId } = request.body;
    // @ts-ignore
    const userId = request.userId;
    if (!userId || !priceId) {
      return response.status(200).json({ error: "No User" });
    }
    const userData = await prisma.user.findFirst({ where: { id: userId } });
    let stripeCustomerId = userData?.stripeCustomerId;
    if (!stripeCustomerId) {
      const stripeCustomerCreated = await stripe.customers.create({
        email: userData?.email,
      });

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: stripeCustomerCreated.id },
      });

      stripeCustomerId = stripeCustomerCreated.id;
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: stripeCustomerId },
      { apiVersion: "2020-08-27" }
    );

    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      trial_period_days: 15,
    });

    saveSubscription(subscription.id, stripeCustomerId, userId);

    if (typeof subscription.pending_setup_intent === "string") {
      const setupIntent = await stripe.setupIntents.retrieve(
        subscription.pending_setup_intent
      );

      return response.status(200).json({
        setupIntent: setupIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: stripeCustomerId,
      });
    } else {
      throw new Error(
        "Expected response type string, but received: " +
          typeof subscription.pending_setup_intent
      );
    }
  }
}
