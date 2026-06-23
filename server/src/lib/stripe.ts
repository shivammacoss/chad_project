import Stripe from 'stripe'

interface StripeLike {
  checkout: {
    sessions: {
      create(args: unknown): Promise<{ id: string; url: string | null }>
    }
  }
  webhooks: {
    constructEvent(body: Buffer, sig: string, secret: string): Stripe.Event
  }
}

let stripe: StripeLike | null = null

export function __setStripe(fake: StripeLike): void {
  stripe = fake
}

export function getStripe(): StripeLike {
  if (stripe) return stripe
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_dummy') as unknown as StripeLike
  return stripe
}
