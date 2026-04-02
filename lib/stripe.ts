import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.warn("STRIPE_SECRET_KEY is not set; Stripe features will be disabled.");
}

export const stripe = secret ? new Stripe(secret, { apiVersion: "2023-10-16" }) : null;
