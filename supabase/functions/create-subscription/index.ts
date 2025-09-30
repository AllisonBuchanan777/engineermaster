declare const Deno: {
    env: {
        get(key: string): string | undefined;
    };
};

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*' // DO NOT CHANGE THIS
};

serve(async (req) => {
    // Handle CORS preflight request
    if (req?.method === 'OPTIONS') {
        return new Response('ok', {
            headers: corsHeaders
        });
    }
    
    try {
        // Create a Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Create a Stripe client
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        const stripe = new Stripe(stripeKey);
        
        // Get the request body
        const { user_id, tier, return_url } = await req?.json();
        
        if (!user_id || !tier) {
            return new Response(JSON.stringify({
                error: 'Missing required fields: user_id and tier'
            }), {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                },
                status: 400
            });
        }

        // Get user profile
        const { data: userProfile, error: profileError } = await supabase?.from('user_profiles')?.select('*')?.eq('id', user_id)?.single();

        if (profileError || !userProfile) {
            return new Response(JSON.stringify({
                error: 'User profile not found'
            }), {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                },
                status: 404
            });
        }

        // Get or create Stripe customer
        let stripeCustomer;
        const { data: existingSubscription } = await supabase?.from('user_subscriptions')?.select('stripe_customer_id')?.eq('user_id', user_id)?.single();

        if (existingSubscription?.stripe_customer_id) {
            stripeCustomer = await stripe?.customers?.retrieve(existingSubscription?.stripe_customer_id);
        } else {
            stripeCustomer = await stripe?.customers?.create({
                email: userProfile?.email,
                name: userProfile?.full_name,
                metadata: {
                    user_id: user_id
                }
            });
        }

        // Define subscription tiers and prices
        const subscriptionPlans = {
            premium: {
                price_id: 'price_premium_monthly', // Replace with actual Stripe price ID
                name: 'Premium Plan',
                features: {
                    lessons_limit: -1, // Unlimited
                    advanced_simulations: true,
                    certification_exams: false,
                    mentorship: false,
                    download_materials: true
                }
            },
            professional: {
                price_id: 'price_professional_monthly', // Replace with actual Stripe price ID
                name: 'Professional Plan',
                features: {
                    lessons_limit: -1,
                    advanced_simulations: true,
                    certification_exams: true,
                    mentorship: true,
                    download_materials: true
                }
            },
            enterprise: {
                price_id: 'price_enterprise_monthly', // Replace with actual Stripe price ID
                name: 'Enterprise Plan',
                features: {
                    lessons_limit: -1,
                    advanced_simulations: true,
                    certification_exams: true,
                    mentorship: true,
                    download_materials: true
                }
            }
        };

        if (!subscriptionPlans?.[tier]) {
            return new Response(JSON.stringify({
                error: 'Invalid subscription tier'
            }), {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                },
                status: 400
            });
        }

        // Create Stripe checkout session
        const session = await stripe?.checkout?.sessions?.create({
            customer: stripeCustomer?.id,
            payment_method_types: ['card'],
            line_items: [{
                price: subscriptionPlans?.[tier]?.price_id,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${return_url || 'https://yourapp.com'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${return_url || 'https://yourapp.com'}/subscription/cancel`,
            metadata: {
                user_id: user_id,
                tier: tier
            },
            subscription_data: {
                metadata: {
                    user_id: user_id,
                    tier: tier
                },
                trial_period_days: 14, // 14-day free trial
            }
        });

        // Create or update user subscription record
        const { error: upsertError } = await supabase?.from('user_subscriptions')?.upsert({
                user_id: user_id,
                tier: tier,
                status: 'trial',
                stripe_customer_id: stripeCustomer?.id,
                features_access: subscriptionPlans?.[tier]?.features,
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)?.toISOString(),
                updated_at: new Date()?.toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (upsertError) {
            console.error('Error updating subscription:', upsertError);
        }

        // Return the Stripe checkout session
        return new Response(JSON.stringify({
            checkout_url: session.url,
            session_id: session.id,
            customer_id: stripeCustomer.id,
            tier: tier,
            trial_days: 14
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
        
    } catch (error) {
        console.error('Subscription creation error:', error);
        return new Response(JSON.stringify({
            error: error.message || 'Failed to create subscription'
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            status: 500
        });
    }
});