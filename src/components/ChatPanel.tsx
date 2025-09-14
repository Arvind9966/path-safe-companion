import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Send, Bot } from 'lucide-react';
import { SafetyAnalysis } from '@/data/mockData';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: SafetyAnalysis;
}

interface ChatMessage {
  id: string;
  type: 'guardian' | 'user';
  content: string;
  timestamp: Date;
}

const ChatPanel = ({ isOpen, onClose, analysis }: ChatPanelProps) => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize with analysis chat lines
    if (isOpen && messages.length === 0) {
      const initialMessages: ChatMessage[] = analysis.chat_lines.map((line, index) => ({
        id: `init-${index}`,
        type: 'guardian' as const,
        content: line,
        timestamp: new Date()
      }));
      setMessages(initialMessages);
    }
  }, [isOpen, analysis.chat_lines, messages.length]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate Guardian response
    setTimeout(() => {
      const responses = language === 'en' ? [
        "I understand your concern. Based on the current analysis, I recommend staying on well-lit main roads.",
        "This area has good police presence during daytime. For evening travel, consider the alternate route I suggested.",
        "You can contact the nearest police station if you feel unsafe. The number is saved in your emergency contacts.",
        "Would you like me to share your location with emergency contacts automatically?"
      ] : [
        "मैं आपकी चिंता समझता हूँ। वर्तमान विश्लेषण के आधार पर, मैं अच्छी रोशनी वाली मुख्य सड़कों पर रहने की सलाह देता हूँ।",
        "इस क्षेत्र में दिन के समय अच्छी पुलिस उपस्थिति है। शाम की यात्रा के लिए, मेरे सुझाए गए वैकल्पिक रूट पर विचार करें।",
        "यदि आप असुरक्षित महसूस करते हैं तो निकटतम पुलिस स्टेशन से संपर्क कर सकते हैं।",
        "क्या आप चाहेंगे कि मैं आपका स्थान आपातकालीन संपर्कों के साथ स्वचालित रूप से साझा करूँ?"
      ];
      
      const guardianMessage: ChatMessage = {
        id: `guardian-${Date.now()}`,
        type: 'guardian',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, guardianMessage]);
    }, 1000);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 lg:static lg:bg-transparent lg:z-auto">
      <div className="absolute right-0 top-0 w-full h-full lg:relative lg:w-96 bg-background border-l border-border">
        <Card className="h-full rounded-none border-0 lg:border lg:rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-guardian" />
              <CardTitle>GuardianAI Chat</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex flex-col h-[calc(100%-80px)] p-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-guardian text-primary-foreground ml-4'
                        : 'bg-muted text-foreground mr-4'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('chat.placeholder')}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  variant="guardian"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {t('chat.ask_guardian')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatPanel;