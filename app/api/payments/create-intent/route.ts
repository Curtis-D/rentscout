import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createPaymentIntent } from '@/lib/paymongo'
import { createPayment } from '@/lib/db/payments'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, paymentMethod } = await request.json()

    // Create payment record in database
    const payment = await createPayment({
      user_id: user.id,
      amount,
      currency: 'PHP',
      status: 'pending',
      payment_method: paymentMethod,
      metadata: {
        plan: 'premium',
        period: 'monthly'
      }
    })

    // Create PayMongo payment intent
    const paymentIntent = await createPaymentIntent({
      amount,
      metadata: {
        user_id: user.id,
        payment_id: payment.id,
        email: user.email
      }
    })

    // Build checkout URL based on payment method
    let paymentUrl = ''
    
    if (paymentMethod === 'card') {
      // For card payments, redirect to PayMongo's hosted checkout
      paymentUrl = `https://checkout.paymongo.com/payment/${paymentIntent.id}`
    } else {
      // For e-wallets, we'll need to handle differently
      // PayMongo will provide the checkout URL after creating a source
      paymentUrl = `/api/payments/process-ewallet?intent=${paymentIntent.id}&method=${paymentMethod}`
    }

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      paymentUrl,
      clientKey: paymentIntent.attributes.client_key
    })
  } catch (error: any) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    )
  }
}