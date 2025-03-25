import StripeNative from "stripe";
import { User } from "@prisma/client";
import PLANS from "@/constants/plans";
import { prisma } from "./prisma";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

class Stripe {
  stripe: StripeNative;

  constructor() {
    this.stripe = new StripeNative(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2025-02-24.acacia",
    });
  }

  async createSession(packageToBuy: string, user: User) {
    const customerId = await this.getCustomerId(user);

    const pkg = PLANS.find((p) => p.id === packageToBuy)!;

    const hasActiveSubscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "active" },
    });

    if (hasActiveSubscription) {
      return null;
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      success_url:
        process.env.NEXT_PUBLIC_BASE_URL +
        "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: process.env.NEXT_PUBLIC_BASE_URL + "/checkout/cancel",
      customer: customerId,
      allow_promotion_codes: true,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: pkg?.name,
            },
            unit_amount: Number((pkg?.monthlyPrice * 100).toFixed(0)),
            recurring: {
              interval: "month",
            },
          },
        },
      ],
      subscription_data: {
        metadata: {
          plan: packageToBuy,
          userId: user.id,
          email: user.email as string,
        },
      },
      metadata: {
        plan: packageToBuy,
        userId: user.id,
        email: user.email as string,
      },
    });

    return session;
  }

  async getCustomerId(user: User) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (subscription?.stripeCustomerId) {
      return subscription.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({
      name: user.name as string,
      email: user.email as string,
    });

    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        stripeCustomerId: customer.id,
      },
      update: {
        stripeCustomerId: customer.id,
      },
    });

    return customer.id;
  }

  async createCustomerPortal(user: User) {
    const customerId = await this.getCustomerId(user);

    const portalSession = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.NEXT_PUBLIC_BASE_URL,
    });

    return portalSession.url;
  }

  async handleInvoicePaymentSuccess(
    event: StripeNative.InvoicePaymentSucceededEvent
  ) {
    // Get the invoice object from the event data
    const invoice = event.data.object;

    // Extract the subscription ID from the invoice
    const subscriptionId = invoice.subscription as string;

    // Check if the subscription ID is found; if not, log an error and exit
    if (!subscriptionId) {
      console.error("❌ Subscription ID not found in invoice", event.id);
      return;
    }

    // Retrieve the subscription details from Stripe using the subscription ID
    const subscription = await this.stripe.subscriptions.retrieve(
      subscriptionId
    );

    // Extract userId and planId from the subscription metadata
    const userId = subscription.metadata?.userId;
    const newPlanId = subscription.metadata?.plan;

    // Check if userId and planId are available in metadata; log an error if not
    if (!userId || !newPlanId) {
      console.error("❌ Metadata missing in subscription", subscriptionId);
      return;
    }

    console.log(`🎉 Updating subscription for user ${userId}`);

    // Update or create a subscription entry in the database
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        subscriptionId, // Store the subscription ID from Stripe
        planId: newPlanId, // Store the plan ID from metadata
        status: "active", // Mark subscription as active initially
        currentPeriodStart: new Date(subscription.current_period_start * 1000), // Convert Stripe's timestamp to Date
        currentPeriodEnd: new Date(subscription.current_period_end * 1000), // Convert Stripe's timestamp to Date
        stripeCustomerId: subscription.customer as string, // Store the customer ID from Stripe
      },
      update: {
        subscriptionId,
        planId: newPlanId,
        status: "active",
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripeCustomerId: subscription.customer as string,
      },
    });

    console.log(`✅ Subscription updated for user ${userId}`);
  }

  async handleInvoicePaymentFailed(
    event: StripeNative.InvoicePaymentFailedEvent
  ) {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription as string;

    if (!subscriptionId) {
      console.error("❌ Subscription ID not found in invoice", event.id);
      return;
    }

    // Fetch subscription to get metadata
    const subscription = await this.stripe.subscriptions.retrieve(
      subscriptionId
    );
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error("❌ Metadata missing in subscription", subscriptionId);
      return;
    }

    // Mark subscription as past_due meaning payment failed
    await prisma.subscription.update({
      where: { userId },
      data: { status: "failed" },
    });

    console.warn(
      `⚠️ Payment failed for user ${userId}, subscription set to past_due`
    );
  }

  async handleSubscriptionDeleted(
    event: StripeNative.CustomerSubscriptionDeletedEvent
  ) {
    const subscriptionId = event.data.object.id;

    const subscription = await prisma.subscription.findFirst({
      where: { subscriptionId },
    });

    if (!subscription) return;

    const userId: string = subscription.userId;

    // Mark subscription as inactive
    await prisma.subscription.update({
      where: { userId },
      data: {
        status: "inactive",
        subscriptionId: "",
      },
    });

    console.log(`🚫 Subscription ended for user ${subscription.userId}`);
  }

  async handleSubscriptionUpdate(
    event: StripeNative.CustomerSubscriptionUpdatedEvent
  ) {
    // Extract subscription object from event
    const subscription = event.data.object;
    const subscriptionId = subscription.id;

    // Retrieve user ID and plan ID from metadata
    const userId = subscription.metadata?.userId;
    const newPlanId = subscription.metadata?.plan;

    if (!userId || !newPlanId) {
      console.error("❌ Metadata missing in subscription", subscriptionId);
      return;
    }

    // Fetch existing subscription from the database
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!existingSubscription) {
      console.error("⚠️ No existing subscription found for user", userId);
      return;
    }

    // Check if the subscription is being canceled
    if (subscription.canceled_at) {
      console.error("❌ Subscription cancelled for user", userId);

      await prisma.subscription.update({
        where: { userId },
        data: {
          status: "canceled",
        },
      });

      return;
    } else {
      await prisma.subscription.update({
        where: { userId },
        data: {
          status: "active",
        },
      });
    }

    console.log(`✅ Subscription updated successfully for user ${userId}`);
  }
}

export const stripe = new Stripe();
