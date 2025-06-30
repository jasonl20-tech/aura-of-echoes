
import React, { useState } from 'react';
import { Key, Eye, EyeOff, Copy, RefreshCw } from 'lucide-react';
import { useWomenApiKeys } from '@/hooks/useWomenApiKeys';
import { useWomen } from '@/hooks/useWomen';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ApiKeysManagement: React.FC = () => {
  const { data: apiKeys, isLoading: keysLoading } = useWomenApiKeys();
  const { data: women, isLoading: womenLoading } = useWomen();
  const { toast } = useToast();
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const copyToClipboard = (text: string, womanName: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `API key for ${womanName} copied to clipboard.`
    });
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 10) return key;
    return key.substring(0, 6) + '•'.repeat(key.length - 10) + key.substring(key.length - 4);
  };

  if (keysLoading || womenLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const getWomanName = (womanId: string) => {
    const woman = women?.find(w => w.id === womanId);
    return woman?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white text-glow">API Keys Management</h2>
        <div className="flex items-center space-x-2 text-white/70">
          <Key className="w-5 h-5" />
          <span>{apiKeys?.length || 0} API Keys</span>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">Women API Keys</h3>
          <p className="text-white/70 text-sm">
            Each woman profile has an automatically generated API key for webhook integration.
          </p>
        </div>

        {apiKeys && apiKeys.length > 0 ? (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="glass rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-white">
                        {getWomanName(apiKey.woman_id)}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        apiKey.active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {apiKey.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <code className="bg-black/30 px-3 py-1 rounded text-sm text-white/90 font-mono">
                        {visibleKeys.has(apiKey.id) ? apiKey.api_key : maskApiKey(apiKey.api_key)}
                      </code>
                      <Button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        size="sm"
                        variant="ghost"
                        className="text-white/60 hover:text-white hover:bg-white/10"
                      >
                        {visibleKeys.has(apiKey.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => copyToClipboard(apiKey.api_key, getWomanName(apiKey.woman_id))}
                        size="sm"
                        variant="ghost"
                        className="text-white/60 hover:text-white hover:bg-white/10"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-xs text-white/50 space-y-1">
                      <div>Created: {new Date(apiKey.created_at).toLocaleDateString()}</div>
                      {apiKey.last_used_at && (
                        <div>Last used: {new Date(apiKey.last_used_at).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No API keys found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeysManagement;
