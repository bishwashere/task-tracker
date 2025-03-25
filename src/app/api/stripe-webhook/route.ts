import { stripe } from "@/lib/stripe";
import tryCatchAsync from "@/lib/try-catch-async";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  const sig = req.headers.get("stripe-signature") as string;

  const [err, event] = await tryCatchAsync(async () => {
    return stripe.stripe.webhooks.constructEvent(
      await req.text(),
      sig,
      endpointSecret
    );
  });

  if (err) {
    console.error("❌ Stripe webhook error", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  switch (event.type) {
    case "invoice.payment_succeeded":
      console.log("✅ Payment successful (Trial Ended or Renewal)");
      await stripe.handleInvoicePaymentSuccess(event);
      break;

    case "invoice.payment_failed":
      console.info("⚠️ Payment failed!");
      await stripe.handleInvoicePaymentFailed(event);
      break;

    case "customer.subscription.deleted":
      console.error("❌ Subscription ended");
      await stripe.handleSubscriptionDeleted(event);
      break;

    case "customer.subscription.updated":
      console.log("✅ Subscription updated");
      await stripe.handleSubscriptionUpdate(event);
      break;

    default:
      console.log(`Ignoring event: ${event.type}`);
  }

  return NextResponse.json({ success: true });
};
