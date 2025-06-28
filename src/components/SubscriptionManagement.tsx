
import React from 'react';
import { CreditCard, Calendar, ExternalLink, AlertCircle, Settings } from 'lucide-react';
import { useSubscriptions, useCustomerPortal } from '../hooks/useSubscriptions';
import { useAuth } from '../hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const SubscriptionManagement: React.FC = () => {
  const { user } = useAuth();
  const { data: subscriptions, isLoading, error } = useSubscriptions();
  const customerPortal = useCustomerPortal();

  const handleManageSubscription = () => {
    customerPortal.mutate(undefined, {
      onError: (error: any) => {
        console.error('Customer Portal Error:', error);
        
        // Specific handling for different error types
        if (error.error === "PORTAL_NOT_CONFIGURED") {
          toast({
            title: "Stripe Portal not configured",
            description: "The Customer Portal must first be configured in the Stripe Dashboard. Contact the administrator.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "Customer Portal could not be opened",
            variant: "destructive",
          });
        }
      }
    });
  };

  if (!user) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="text-center p-4">
          <p className="text-white/70">You must be signed in to manage your subscriptions.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CreditCard className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Subscriptions</h2>
        </div>
        <div className="text-center p-4">
          <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-white/70">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CreditCard className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Subscriptions</h2>
        </div>
        <div className="text-center p-4 glass rounded-xl border border-red-500/20">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400">Error loading subscriptions</p>
          <p className="text-white/70 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  const activeSubscriptions = subscriptions?.filter(sub => sub.active) || [];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <CreditCard className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-semibold text-white">Subscriptions</h2>
      </div>

      {activeSubscriptions.length === 0 ? (
        <div className="text-center p-6 glass rounded-xl">
          <CreditCard className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <p className="text-white font-medium mb-2">No active subscriptions</p>
          <p className="text-white/70 text-sm mb-4">You currently have no active subscriptions.</p>
          
          <button
            onClick={handleManageSubscription}
            disabled={customerPortal.isPending}
            className="flex items-center space-x-2 glass-button px-4 py-2 rounded-lg text-purple-300 hover:text-white hover:bg-purple-600/30 transition-all duration-300 disabled:opacity-50 mx-auto"
          >
            <ExternalLink className="w-4 h-4" />
            <span>
              {customerPortal.isPending ? 'Opening...' : 'Create subscription'}
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeSubscriptions.map((subscription) => (
            <div key={subscription.id} className="p-4 glass rounded-xl border border-purple-500/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">Active subscription</span>
                    {subscription.stripe_subscription_id ? (
                      <span className="px-2 py-1 bg-purple-600/30 text-purple-300 text-xs rounded-full">
                        Stripe
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-600/30 text-blue-300 text-xs rounded-full">
                        Direct
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2 text-white/70">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Created: {new Date(subscription.created_at).toLocaleDateString('en-US')}
                      </span>
                    </div>
                    
                    {subscription.expires_at && (
                      <div className="flex items-center space-x-2 text-white/70">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Expires: {new Date(subscription.expires_at).toLocaleDateString('en-US')}
                        </span>
                      </div>
                    )}
                    
                    {subscription.stripe_customer_id && (
                      <div className="text-white/50 text-xs">
                        Customer ID: {subscription.stripe_customer_id.substring(0, 20)}...
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4">
                  <button
                    onClick={handleManageSubscription}
                    disabled={customerPortal.isPending}
                    className="flex items-center space-x-2 glass-button px-4 py-2 rounded-lg text-purple-300 hover:text-white hover:bg-purple-600/30 transition-all duration-300 disabled:opacity-50"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>
                      {customerPortal.isPending ? 'Opening...' : 'Manage'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Summary section */}
          <div className="mt-6 p-4 glass rounded-xl border border-purple-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">
                  {activeSubscriptions.length} active subscription{activeSubscriptions.length === 1 ? '' : 's'}
                </p>
                <p className="text-white/70 text-sm">
                  All subscriptions can be managed through the Stripe Portal
                </p>
              </div>
              
              <button
                onClick={handleManageSubscription}
                disabled={customerPortal.isPending}
                className="glass-button px-4 py-2 rounded-lg text-purple-300 hover:text-white hover:bg-purple-600/30 transition-all duration-300 disabled:opacity-50"
              >
                {customerPortal.isPending ? 'Opening...' : 'Manage all'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration notice */}
      <div className="mt-6 p-3 glass rounded-xl border border-orange-500/20 bg-orange-500/5">
        <div className="flex items-start space-x-2">
          <Settings className="w-4 h-4 text-orange-400 mt-0.5" />
          <div className="text-sm">
            <p className="text-orange-300 font-medium">Administrator notice</p>
            <p className="text-orange-200/70 text-xs">
              If the Customer Portal doesn't work, it must first be configured in the{' '}
              <a 
                href="https://dashboard.stripe.com/settings/billing/portal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-orange-200"
              >
                Stripe Dashboard
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
