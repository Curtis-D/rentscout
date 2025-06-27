import { supabase } from '@/lib/supabase'

export interface Payment {
  id: string
  user_id: string
  payment_method_id?: string
  payment_intent_id?: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed'
  payment_method?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  status: 'active' | 'cancelled' | 'expired' | 'past_due'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  cancelled_at?: string
  payment_id?: string
  created_at: string
  updated_at: string
}

// Create a payment record
export async function createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single()

  if (error) throw error
  return data as Payment
}

// Update payment status
export async function updatePaymentStatus(paymentId: string, status: Payment['status'], paymentIntentId?: string) {
  const { data, error } = await supabase
    .from('payments')
    .update({ 
      status, 
      payment_intent_id: paymentIntentId,
      updated_at: new Date().toISOString() 
    })
    .eq('id', paymentId)
    .select()
    .single()

  if (error) throw error
  return data as Payment
}

// Get user's payments
export async function getUserPayments(userId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Payment[]
}

// Create or update subscription
export async function createOrUpdateSubscription(subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) {
  // Check if user already has a subscription
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', subscription.user_id)
    .single()

  if (existing) {
    // Update existing subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        ...subscription,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data as Subscription
  } else {
    // Create new subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single()

    if (error) throw error
    return data as Subscription
  }
}

// Get user's active subscription
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Subscription | null
}

// Cancel subscription at period end
export async function cancelSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      cancel_at_period_end: true,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('status', 'active')
    .select()
    .single()

  if (error) throw error
  return data as Subscription
}

// Update user to premium tier
export async function upgradeUserToPremium(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .update({
      subscription_tier: 'premium',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}