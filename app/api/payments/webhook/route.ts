import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { 
  updatePaymentStatus, 
  createOrUpdateSubscription,
  upgradeUserToPremium 
} from '@/lib/db/payments'

// PayMongo webhook secret from environment
const WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('paymongo-signature')
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 401 })
    }

    const rawBody = await request.text()
    const json = JSON.parse(rawBody)

    // TODO: Implement signature verification
    // For now, we'll trust the webhook

    const { data } = json
    const eventType = data.attributes.type

    switch (eventType) {
      case 'payment.paid':
        await handlePaymentSuccess(data.attributes.data)
        break
      case 'payment.failed':
        await handlePaymentFailure(data.attributes.data)
        break
      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentData: any) {
  const { metadata } = paymentData.attributes
  const { user_id, payment_id } = metadata

  // Update payment status
  await updatePaymentStatus(payment_id, 'succeeded', paymentData.id)

  // Create or update subscription
  const now = new Date()
  const endDate = new Date(now)
  endDate.setMonth(endDate.getMonth() + 1)

  await createOrUpdateSubscription({
    user_id,
    status: 'active',
    current_period_start: now.toISOString(),
    current_period_end: endDate.toISOString(),
    cancel_at_period_end: false,
    payment_id,
  })

  // Upgrade user to premium
  await upgradeUserToPremium(user_id)
}

async function handlePaymentFailure(paymentData: any) {
  const { metadata } = paymentData.attributes
  const { payment_id } = metadata

  // Update payment status
  await updatePaymentStatus(payment_id, 'failed', paymentData.id)
}