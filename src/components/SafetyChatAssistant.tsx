import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SafetyChatAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Get user location for context
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    // Load chat history
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    try {
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('messages')
        .eq('user_id', user?.id)
        .eq('session_type', 'safety_chat')
        .eq('is_active', true)
        .single();

      if (session?.messages && Array.isArray(session.messages)) {
        const chatMessages = session.messages as unknown as ChatMessage[];
        setMessages(chatMessages);
      }
    } catch (error) {
      console.log('No existing chat history');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('safety-chat-assistant', {
        body: {
          message: inputMessage,
          userId: user?.id,
          location: location,
          chatHistory: messages.slice(-10) // Send last 10 messages for context
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Failed to get response from safety assistant",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="glass-panel border-0 h-full flex flex-col">
      <CardHeader className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-6">
        <CardTitle className="text-platinum flex items-center gap-2 text-lg sm:text-xl">
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">GuardianAI Safety Assistant</span>
          <span className="sm:hidden">GuardianAI</span>
        </CardTitle>
        <CardDescription className="text-silver text-sm sm:text-base">
          Ask about route safety, crime reports, emergency procedures, and safety tips
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col min-h-0 px-4 sm:px-6">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4 min-h-0">
          {messages.length === 0 && (
            <div className="text-center text-silver py-4 sm:py-8">
              <Bot className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-sapphire" />
              <p className="mb-2 text-sm sm:text-base">Hello! I'm your safety assistant.</p>
              <p className="text-xs sm:text-sm">Ask me about:</p>
              <ul className="text-xs sm:text-sm mt-2 space-y-1">
                <li>• Route safety analysis</li>
                <li>• Emergency contacts and procedures</li>
                <li>• Safety tips and precautions</li>
                <li>• Incident reporting guidance</li>
              </ul>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-emerald/20 text-emerald' 
                  : 'bg-sapphire/20 text-sapphire'
              }`}>
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              
              <div className={`flex-1 max-w-[80%] ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}>
                <div className={`inline-block p-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-emerald/10 text-platinum ml-auto'
                    : 'bg-silver/10 text-platinum'
                } ${message.role === 'user' ? 'rounded-tr-md' : 'rounded-tl-md'}`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className="text-xs text-silver mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sapphire/20 text-sapphire flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="bg-silver/10 text-platinum p-3 rounded-2xl rounded-tl-md">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-sapphire border-t-transparent rounded-full"></div>
                    <span>Analyzing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="flex-shrink-0 flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about safety concerns..."
            className="glass-input border-silver/20 text-platinum flex-1 h-10 sm:h-11 text-sm sm:text-base"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="gradient-sapphire hover:scale-105 transition-transform h-10 sm:h-11 px-3 sm:px-4"
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SafetyChatAssistant;