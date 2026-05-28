import { Router, Response } from 'express';
import { stripe } from '../config/stripe';
import { User } from '../models/User';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const router = Router();

// 1. Create Stripe Checkout Session
router.post('/create-checkout', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return next(new AppError('Usuário não autenticado.', 401));
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return next(new AppError('Usuário não encontrado.', 404));
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return next(new AppError('Price ID do Stripe não configurado no servidor.', 500));
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Check if customer already exists in Stripe or create one
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id }
      });
      customerId = customer.id;
      await user.update({ stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/profile`,
      metadata: {
        userId: user.id
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

// 2. Stripe Customer Portal for managing subscription
router.post('/portal', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return next(new AppError('Usuário não autenticado.', 401));
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return next(new AppError('Usuário não encontrado.', 404));
    }

    if (!user.stripeCustomerId) {
      return next(new AppError('Nenhuma assinatura Stripe encontrada para esta conta.', 400));
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${frontendUrl}/profile`,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    next(error);
  }
});

// 3. GET current subscription status
router.get('/status', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return next(new AppError('Usuário não autenticado.', 401));
    }

    const user = await User.findByPk(userId, {
      attributes: ['subscriptionStatus', 'premiumExpiresAt']
    });

    if (!user) {
      return next(new AppError('Usuário não encontrado.', 404));
    }

    res.json({
      status: user.subscriptionStatus,
      expiresAt: user.premiumExpiresAt
    });
  } catch (error) {
    next(error);
  }
});

// 4. Webhook handler (anonymous, raw body required)
router.post('/webhook', async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return next(new AppError('Assinatura do webhook ou segredo ausente.', 400));
  }

  let event;

  try {
    // Construct event using the raw request body
    event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook Error] ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const stripeCustomerId = session.customer;
        const subscriptionId = session.subscription;
        
        // Find user by stripeCustomerId or metadata.userId
        const userId = session.metadata?.userId;
        let user;
        if (userId) {
          user = await User.findByPk(userId);
        } else {
          user = await User.findOne({ where: { stripeCustomerId } });
        }

        if (user) {
          // Retrieve subscription to get current period end
          const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
          const expiresAt = new Date(subscription.current_period_end * 1000);

          await user.update({
            subscriptionStatus: 'premium',
            subscriptionId,
            stripeCustomerId,
            premiumExpiresAt: expiresAt
          });
          console.log(`[Stripe] User ${user.email} upgraded to Premium until ${expiresAt.toISOString()}`);
        } else {
          console.error(`[Stripe Webhook] User not found for customerId: ${stripeCustomerId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const stripeCustomerId = subscription.customer;
        const subscriptionId = subscription.id;
        const expiresAt = new Date(subscription.current_period_end * 1000);
        
        // Handle cancelled or active state
        let status: 'premium' | 'cancelled' | 'free' = 'premium';
        if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          status = 'cancelled';
        }

        const user = await User.findOne({ where: { stripeCustomerId } });
        if (user) {
          await user.update({
            subscriptionStatus: status,
            subscriptionId,
            premiumExpiresAt: expiresAt
          });
          console.log(`[Stripe] User ${user.email} subscription updated to status: ${status}, expiresAt: ${expiresAt.toISOString()}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const stripeCustomerId = subscription.customer;

        const user = await User.findOne({ where: { stripeCustomerId } });
        if (user) {
          await user.update({
            subscriptionStatus: 'cancelled',
            premiumExpiresAt: new Date() // expired now
          });
          console.log(`[Stripe] User ${user.email} subscription deleted / cancelled`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        console.warn(`[Stripe Alert] Payment failed for invoice ${invoice.id}, customer: ${invoice.customer}`);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

export default router;
