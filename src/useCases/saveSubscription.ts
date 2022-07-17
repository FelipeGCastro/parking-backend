import { prisma } from "../database/prisma";
import { stripe } from "../services/stripe";

export async function saveSubscription(
  subscriptionId: string,
  stripeCustomerId: string,
  userId?: string
) {
  if (!userId) {
    const user = await prisma.user.findFirst({ where: { stripeCustomerId } });
    userId = user?.id;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await prisma.subscription.upsert({
    where: { subscriptionId: subscription.id },
    update: { status: subscription.status },
    create: {
      subscriptionId: subscription.id,
      userId,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
    },
  });
}
