import { useState, useRef, useEffect } from 'react';
import { Send, CloudSun, Loader2, LogOut } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: number;
  role: 'user' | 'bot';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      role: 'bot', 
      content: 'Hello! Ask me about the weather or upload a PDF to chat about climate documents.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExited, setIsExited] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.content }),
      });

      if (!response.ok) throw new Error("Server error");
      const data = await response.json();

      const botMessage: Message = { id: Date.now() + 1, role: 'bot', content: data.response };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error(error);
      const errorMessage: Message = { 
        id: Date.now() + 1, 
        role: 'bot', 
        content: "⚠️ **Error:** I couldn't reach the weather server. Please check if the backend is running." 
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

const handleExit = async () => {
    // 1. Define the base URL using the environment variable you set in Vercel
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    try {
      // 2. Use the full URL instead of a relative path
      const response = await fetch(`${API_BASE_URL}/api/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      
      if (response.ok) {
        setIsExited(true);
      } else {
        // Handle case where server responds but with an error
        console.error("Server responded with an error");
        setIsExited(true); 
      }
    } catch (error) {
      console.error("Failed to save summary:", error);
      alert("Chat session ended, but summary couldn't be saved.");
      setIsExited(true);
    }
  };

  // Switch to Summary/Exit Screen
  if (isExited) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
        <Card className="w-full max-w-md p-8 text-center shadow-xl border-none">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-50 rounded-full">
              <CloudSun className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Session Closed</h2>
          <p className="text-slate-600 mb-6">Your conversation summary has been successfully saved to the backend. See you next time!</p>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 font-semibold py-6" 
            onClick={() => window.location.reload()}
          >
            Start New Session
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-2xl h-[700px] flex flex-col shadow-2xl border-none">
        
        {/* Header */}
        <CardHeader className="border-b bg-white rounded-t-xl py-4 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-blue-600 font-bold">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CloudSun className="w-6 h-6" />
            </div>
            Weather Intelligence Bot
          </CardTitle>
          <Button 
            variant="ghost" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50 font-medium" 
            onClick={handleExit}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Done
          </Button>
        </CardHeader>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4 bg-slate-50/50">
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <article className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </article>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3 text-slate-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  Analyzing weather data...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <CardFooter className="p-4 bg-white border-t rounded-b-xl">
          <form 
            className="flex w-full gap-3"
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          >
            <Input 
              className="flex-1 bg-slate-100 border-none focus-visible:ring-2 focus-visible:ring-blue-500"
              placeholder="Ask about weather or docs..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 transition-all px-6"
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardFooter>

      </Card>
    </div>
  );
}

export default App;