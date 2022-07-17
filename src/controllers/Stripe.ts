import { Request, Response } from "express";
import { stripe } from "../services/stripe";

export class StripeController {
  async index(request: Request, response: Response): Promise<Response> {
    const prices = await stripe.prices.list({
      product: process.env.STRIPE_PRODUCT_ID,
    });
    return response.status(200).json({ prices: prices.data });
  }

  async show(request: Request, response: Response): Promise<Response> {
    return response.status(200).json({ key: process.env.STRIPE_API_KEY });
  }
}
