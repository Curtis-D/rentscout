import axios from 'axios'

const getPaymongoApi = () => {
  const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY
  
  if (!PAYMONGO_SECRET_KEY) {
    throw new Error('PAYMONGO_SECRET_KEY is not configured')
  }
  
  // Base64 encode the secret key for API authentication
  const encodedKey = Buffer.from(PAYMONGO_SECRET_KEY).toString('base64')
  
  return axios.create({
    baseURL: 'https://api.paymongo.com/v1',
    headers: {
      'Authorization': `Basic ${encodedKey}`,
      'Content-Type': 'application/json',
    },
  })
}

export interface CreatePaymentIntentData {
  amount: number // in centavos
  currency?: string
  description?: string
  metadata?: Record<string, any>
}

export interface PaymentMethod {
  id: string
  type: string
  billing?: {
    name: string
    email: string
    phone?: string
  }
}

// Create a payment intent for subscription
export async function createPaymentIntent(data: CreatePaymentIntentData) {
  try {
    const paymongoApi = getPaymongoApi()
    const response = await paymongoApi.post('/payment_intents', {
      data: {
        type: 'payment_intent',
        attributes: {
          amount: data.amount,
          payment_method_allowed: ['card', 'gcash', 'paymaya'],
          payment_method_options: {
            card: {
              request_three_d_secure: 'any'
            }
          },
          currency: data.currency || 'PHP',
          description: data.description || 'RentScout Premium Subscription',
          statement_descriptor: 'RentScout PH',
          metadata: data.metadata || {},
        }
      }
    })

    return response.data.data
  } catch (error: any) {
    console.error('PayMongo error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Payment creation failed')
  }
}

// Attach payment method to payment intent
export async function attachPaymentMethod(paymentIntentId: string, paymentMethodId: string) {
  try {
    const paymongoApi = getPaymongoApi()
    const response = await paymongoApi.post(`/payment_intents/${paymentIntentId}/attach`, {
      data: {
        type: 'payment_intent',
        attributes: {
          payment_method: paymentMethodId,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`
        }
      }
    })

    return response.data.data
  } catch (error: any) {
    console.error('PayMongo attach error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Payment method attachment failed')
  }
}

// Retrieve payment intent status
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const paymongoApi = getPaymongoApi()
    const response = await paymongoApi.get(`/payment_intents/${paymentIntentId}`)
    return response.data.data
  } catch (error: any) {
    console.error('PayMongo retrieve error:', error.response?.data || error.message)
    throw new Error('Failed to retrieve payment status')
  }
}

// Create payment method (for client-side use)
export async function createPaymentMethod(type: string, details: any, billing: any) {
  try {
    const response = await axios.post(
      'https://api.paymongo.com/v1/payment_methods',
      {
        data: {
          type: 'payment_method',
          attributes: {
            type,
            details,
            billing,
          }
        }
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY || '').toString('base64')}`,
          'Content-Type': 'application/json',
        }
      }
    )

    return response.data.data
  } catch (error: any) {
    console.error('PayMongo payment method error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Payment method creation failed')
  }
}