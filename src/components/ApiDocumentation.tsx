
import React, { useState } from 'react';
import { Copy, ExternalLink, CheckCircle, AlertCircle, Code, Send } from 'lucide-react';
import { useWomen } from '@/hooks/useWomen';
import { useWomenApiKeys } from '@/hooks/useWomenApiKeys';
import { toast } from '@/hooks/use-toast';

const ApiDocumentation: React.FC = () => {
  const { data: women } = useWomen();
  const { data: apiKeys } = useWomenApiKeys();
  const [selectedWomanId, setSelectedWomanId] = useState<string>('');
  const [testChatId, setTestChatId] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [isTestingApi, setIsTestingApi] = useState(false);

  const selectedWoman = women?.find(w => w.id === selectedWomanId);
  const selectedApiKey = apiKeys?.find(key => key.woman_id === selectedWomanId);

  const supabaseUrl = 'https://axarouxelvazgeewnakv.supabase.co';
  const receiveMessageUrl = `${supabaseUrl}/functions/v1/receive-message`;
  const typingStatusUrl = `${supabaseUrl}/functions/v1/set-typing-status`;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Kopiert!",
        description: `${label} wurde in die Zwischenablage kopiert.`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: `${label} konnte nicht kopiert werden.`,
        variant: "destructive",
      });
    }
  };

  const testApiEndpoint = async () => {
    if (!selectedApiKey || !testChatId || !testMessage) {
      toast({
        title: "Fehler",
        description: "Bitte wähle eine Frau aus und gib Chat-ID und Nachricht ein.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingApi(true);
    try {
      const response = await fetch(receiveMessageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': selectedApiKey.api_key,
        },
        body: JSON.stringify({
          chatId: testChatId,
          message: testMessage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Test erfolgreich!",
          description: "Die API-Anfrage wurde erfolgreich verarbeitet.",
        });
      } else {
        toast({
          title: "Test fehlgeschlagen",
          description: data.error || 'Unbekannter Fehler',
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test fehlgeschlagen",
        description: "Netzwerkfehler beim Testen der API.",
        variant: "destructive",
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  const generateCurlCommand = () => {
    if (!selectedApiKey) return '';
    
    return `curl -X POST "${receiveMessageUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${selectedApiKey.api_key}" \\
  -d '{
    "chatId": "CHAT_ID_HIER",
    "message": "Hallo! Ich bin deine AI-Freundin und freue mich von dir zu hören!"
  }'`;
  };

  const generateTypingCurlCommand = () => {
    if (!selectedApiKey) return '';
    
    return `# Tippen starten
curl -X POST "${typingStatusUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${selectedApiKey.api_key}" \\
  -d '{
    "chatId": "CHAT_ID_HIER",
    "isTyping": true
  }'

# Tippen stoppen
curl -X POST "${typingStatusUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${selectedApiKey.api_key}" \\
  -d '{
    "chatId": "CHAT_ID_HIER",
    "isTyping": false
  }'`;
  };

  const generateJavaScriptExample = () => {
    if (!selectedApiKey) return '';
    
    return `const response = await fetch('${receiveMessageUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${selectedApiKey.api_key}'
  },
  body: JSON.stringify({
    chatId: 'CHAT_ID_HIER',
    message: 'Hallo! Ich bin deine AI-Freundin und freue mich von dir zu hören!'
  })
});

const data = await response.json();
console.log('Response:', data);`;
  };

  const generateTypingJavaScriptExample = () => {
    if (!selectedApiKey) return '';
    
    return `// Tippen starten
const startTyping = async (chatId) => {
  await fetch('${typingStatusUrl}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '${selectedApiKey.api_key}'
    },
    body: JSON.stringify({
      chatId: chatId,
      isTyping: true
    })
  });
};

// Tippen stoppen
const stopTyping = async (chatId) => {
  await fetch('${typingStatusUrl}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '${selectedApiKey.api_key}'
    },
    body: JSON.stringify({
      chatId: chatId,
      isTyping: false
    })
  });
};`;
  };

  const generatePythonExample = () => {
    if (!selectedApiKey) return '';
    
    return `import requests
import json

url = "${receiveMessageUrl}"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${selectedApiKey.api_key}"
}
payload = {
    "chatId": "CHAT_ID_HIER",
    "message": "Hallo! Ich bin deine AI-Freundin und freue mich von dir zu hören!"
}

response = requests.post(url, headers=headers, data=json.dumps(payload))
print(response.json())`;
  };

  const generateTypingPythonExample = () => {
    if (!selectedApiKey) return '';
    
    return `import requests
import json

def set_typing_status(chat_id, is_typing):
    url = "${typingStatusUrl}"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": "${selectedApiKey.api_key}"
    }
    payload = {
        "chatId": chat_id,
        "isTyping": is_typing
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    return response.json()

# Verwendung:
set_typing_status("CHAT_ID_HIER", True)   # Tippen starten
set_typing_status("CHAT_ID_HIER", False)  # Tippen stoppen`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white text-glow mb-2">
          API Dokumentation
        </h1>
        <p className="text-white/70">
          Komplette Anleitung zur Integration der API-Endpoints
        </p>
      </div>

      {/* Overview */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Code className="w-5 h-5" />
          <span>API Übersicht</span>
        </h2>
        
        <div className="space-y-4 text-white/80">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Message Flow:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>1. User sendet Nachricht → <code className="bg-black/30 px-2 py-1 rounded">send-message</code> function</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>2. System ruft dein Webhook auf (mit Chat-Details)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>3. Deine AI generiert Antwort</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>4. [Optional] Du sendest "Schreibt gerade" Status → <code className="bg-black/30 px-2 py-1 rounded">set-typing-status</code> function</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>5. Du sendest Antwort → <code className="bg-black/30 px-2 py-1 rounded">receive-message</code> function</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>6. Nachricht erscheint im Chat</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Endpoints */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Verfügbare Endpoints</h2>
        
        <div className="space-y-6">
          {/* Receive Message Endpoint */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">1. Nachrichten senden</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm font-medium">URL</label>
                <div className="glass rounded-lg p-3 flex items-center justify-between">
                  <code className="text-green-400 text-sm font-mono">{receiveMessageUrl}</code>
                  <button
                    onClick={() => copyToClipboard(receiveMessageUrl, 'Receive Message URL')}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-white/70" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-white/70 text-sm font-medium">Methode</label>
                <div className="glass rounded-lg p-3">
                  <span className="text-orange-400 font-semibold">POST</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm font-medium">Request Body</label>
              <div className="glass rounded-lg p-3">
                <pre className="text-green-400 text-sm font-mono">{`{
  "chatId": "uuid-des-chats",
  "message": "Die Antwort der AI/Frau"
}`}</pre>
              </div>
            </div>
          </div>

          {/* Typing Status Endpoint */}
          <div className="space-y-4 border-t border-white/10 pt-4">
            <h3 className="text-lg font-semibold text-white">2. "Schreibt gerade" Animation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm font-medium">URL</label>
                <div className="glass rounded-lg p-3 flex items-center justify-between">
                  <code className="text-purple-400 text-sm font-mono">{typingStatusUrl}</code>
                  <button
                    onClick={() => copyToClipboard(typingStatusUrl, 'Typing Status URL')}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-white/70" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-white/70 text-sm font-medium">Methode</label>
                <div className="glass rounded-lg p-3">
                  <span className="text-orange-400 font-semibold">POST</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm font-medium">Request Body</label>
              <div className="glass rounded-lg p-3">
                <pre className="text-purple-400 text-sm font-mono">{`{
  "chatId": "uuid-des-chats",
  "isTyping": true    // true = Animation starten, false = stoppen
}`}</pre>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="text-purple-400 font-semibold mb-2">Typing Animation Workflow:</h4>
              <ul className="text-purple-400/80 text-sm space-y-1">
                <li>• Sende <code className="bg-black/30 px-1 rounded">isTyping: true</code> bevor deine AI zu antworten beginnt</li>
                <li>• Die Animation zeigt "NAME schreibt..." mit animierten Punkten</li>
                <li>• Sende <code className="bg-black/30 px-1 rounded">isTyping: false</code> oder sende einfach die Nachricht</li>
                <li>• Die Animation verschwindet automatisch wenn eine neue Nachricht ankommt</li>
              </ul>
            </div>
          </div>

          <div>
            <label className="text-white/70 text-sm font-medium">Required Headers (für beide Endpoints)</label>
            <div className="glass rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <code className="text-blue-400">Content-Type: application/json</code>
              </div>
              <div className="flex justify-between items-center">
                <code className="text-blue-400">x-api-key: [DEIN_API_KEY]</code>
                <span className="text-white/50 text-xs">Pro Frau einzigartig</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-white/70 text-sm font-medium">Success Response</label>
            <div className="glass rounded-lg p-3">
              <pre className="text-green-400 text-sm font-mono">{`{
  "success": true,
  "message": "Request processed successfully"
}`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Woman Selection & API Keys */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">API Keys pro Frau</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-white/70 text-sm font-medium mb-2 block">Frau auswählen</label>
            <select
              value={selectedWomanId}
              onChange={(e) => setSelectedWomanId(e.target.value)}
              className="w-full glass rounded-lg px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Frau auswählen --</option>
              {women?.map((woman) => (
                <option key={woman.id} value={woman.id} className="bg-gray-800">
                  {woman.name}
                </option>
              ))}
            </select>
          </div>

          {selectedWoman && selectedApiKey && (
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm font-medium mb-2 block">
                  API Key für {selectedWoman.name}
                </label>
                <div className="glass rounded-lg p-3 flex items-center justify-between">
                  <code className="text-purple-400 font-mono text-sm">{selectedApiKey.api_key}</code>
                  <button
                    onClick={() => copyToClipboard(selectedApiKey.api_key, 'API Key')}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-white/70" />
                  </button>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold">Wichtige Sicherheitshinweise:</span>
                </div>
                <ul className="text-yellow-400/80 text-sm space-y-1">
                  <li>• Teile den API-Key niemals öffentlich</li>
                  <li>• Verwende ihn nur in deinen Backend-Services</li>
                  <li>• Jede Frau hat ihren eigenen einzigartigen API-Key</li>
                  <li>• Du kannst nur Nachrichten für Chats dieser Frau senden</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Code Examples */}
      {selectedApiKey && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Code Beispiele</h2>
          
          <div className="space-y-8">
            {/* cURL Examples */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">cURL Beispiele</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Nachricht senden</h4>
                    <button
                      onClick={() => copyToClipboard(generateCurlCommand(), 'cURL Command')}
                      className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">Kopieren</span>
                    </button>
                  </div>
                  <div className="glass rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                      {generateCurlCommand()}
                    </pre>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Typing Status setzen</h4>
                    <button
                      onClick={() => copyToClipboard(generateTypingCurlCommand(), 'Typing cURL Commands')}
                      className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">Kopieren</span>
                    </button>
                  </div>
                  <div className="glass rounded-lg p-4 overflow-x-auto">
                    <pre className="text-purple-400 text-sm font-mono whitespace-pre-wrap">
                      {generateTypingCurlCommand()}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* JavaScript Examples */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">JavaScript Beispiele</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Nachricht senden</h4>
                    <button
                      onClick={() => copyToClipboard(generateJavaScriptExample(), 'JavaScript Code')}
                      className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">Kopieren</span>
                    </button>
                  </div>
                  <div className="glass rounded-lg p-4 overflow-x-auto">
                    <pre className="text-blue-400 text-sm font-mono whitespace-pre-wrap">
                      {generateJavaScriptExample()}
                    </pre>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Typing Status Functions</h4>
                    <button
                      onClick={() => copyToClipboard(generateTypingJavaScriptExample(), 'Typing JavaScript Code')}
                      className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">Kopieren</span>
                    </button>
                  </div>
                  <div className="glass rounded-lg p-4 overflow-x-auto">
                    <pre className="text-purple-400 text-sm font-mono whitespace-pre-wrap">
                      {generateTypingJavaScriptExample()}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Python Examples */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Python Beispiele</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Nachricht senden</h4>
                    <button
                      onClick={() => copyToClipboard(generatePythonExample(), 'Python Code')}
                      className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">Kopieren</span>
                    </button>
                  </div>
                  <div className="glass rounded-lg p-4 overflow-x-auto">
                    <pre className="text-yellow-400 text-sm font-mono whitespace-pre-wrap">
                      {generatePythonExample()}
                    </pre>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Typing Status Function</h4>
                    <button
                      onClick={() => copyToClipboard(generateTypingPythonExample(), 'Typing Python Code')}
                      className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">Kopieren</span>
                    </button>
                  </div>
                  <div className="glass rounded-lg p-4 overflow-x-auto">
                    <pre className="text-purple-400 text-sm font-mono whitespace-pre-wrap">
                      {generateTypingPythonExample()}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Testing */}
      {selectedApiKey && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>API Testen</span>
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm font-medium mb-2 block">Chat ID</label>
                <input
                  type="text"
                  value={testChatId}
                  onChange={(e) => setTestChatId(e.target.value)}
                  placeholder="UUID des Chats eingeben..."
                  className="w-full glass rounded-lg px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="text-white/70 text-sm font-medium mb-2 block">Test Nachricht</label>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Test-Antwort eingeben..."
                  className="w-full glass rounded-lg px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <button
              onClick={testApiEndpoint}
              disabled={isTestingApi || !testChatId || !testMessage}
              className="w-full md:w-auto glass-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-green-600/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isTestingApi ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Teste...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>API Testen</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Integration Tips */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Integration Tipps</h2>
        
        <div className="space-y-4 text-white/80">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-2 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Best Practices:</span>
            </h3>
            <ul className="text-green-400/80 text-sm space-y-1">
              <li>• Verwende immer HTTPS für sichere Übertragung</li>
              <li>• Implementiere Retry-Logic für failed requests</li>
              <li>• Logge API calls für Debugging</li>
              <li>• Validiere chat_id bevor du Nachrichten sendest</li>
              <li>• Beschränke Nachrichtenlänge (max. 2000 Zeichen empfohlen)</li>
              <li>• Setze Typing-Status auf false bevor du eine Nachricht sendest</li>
            </ul>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <h3 className="text-purple-400 font-semibold mb-2">Typing Animation Tipps:</h3>
            <ul className="text-purple-400/80 text-sm space-y-1">
              <li>• Starte die Animation bevor deine AI zu denken beginnt</li>
              <li>• Vergiss nicht die Animation zu stoppen</li>
              <li>• Die Animation stoppt automatisch bei neuen Nachrichten</li>
              <li>• Nutze realistische Timing (2-5 Sekunden sind gut)</li>
            </ul>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-2">Webhook Payload (was du erhältst):</h3>
            <pre className="text-blue-400/80 text-sm font-mono">{`{
  "chatId": "3497b0c9-099c-4695-acc8-a49b56c1fdab",
  "message": "User-Nachricht hier",
  "character": {
    "name": "Frauenname",
    "personality": "Persönlichkeitsbeschreibung"
  },
  "user_id": "ff381670-3c86-4d9d-acf9-d7af403c6878"
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation;
