import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Loader2, Camera, FileCheck, Monitor, RotateCcw, Hand, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from '@/types/proctor';
import { cn } from '@/lib/utils';

interface StepAction {
  label: string;
  icon: React.ReactNode;
  description: string;
  needsCapture?: boolean;
}

const stepActions: Record<number, StepAction> = {
  2: {
    label: 'Capture ID & Verify',
    icon: <Camera className="w-5 h-5" />,
    description: 'Hold your ID close to the camera before clicking',
    needsCapture: true,
  },
  3: {
    label: 'Verify Items',
    icon: <FileCheck className="w-5 h-5" />,
    description: 'Show your scratch paper clearly to the camera',
    needsCapture: true,
  },
  4: {
    label: 'Scan Workspace',
    icon: <Monitor className="w-5 h-5" />,
    description: 'Ensure your entire desk area is visible',
    needsCapture: true,
  },
  5: {
    label: 'Start Environment Scan',
    icon: <RotateCcw className="w-5 h-5" />,
    description: 'Slowly rotate camera 360° to show your room',
    needsCapture: true,
  },
  6: {
    label: 'Verify',
    icon: <Hand className="w-5 h-5" />,
    description: 'Show ears, wrists, and hands to the camera',
    needsCapture: true,
  },
  7: {
    label: 'Confirm & Start Exam',
    icon: <CheckCircle className="w-5 h-5" />,
    description: 'Review and confirm you are ready to begin',
    needsCapture: false,
  },
};

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  canSend: boolean;
  currentStep: number;
  onSendMessage: (message: string) => void;
  onCaptureAndVerify?: () => void;
  onStepAction?: () => void;
}

export function ChatWindow({ 
  messages, 
  isLoading, 
  canSend, 
  currentStep,
  onSendMessage,
  onCaptureAndVerify,
  onStepAction,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canSend || isLoading) return;
    
    onSendMessage(input.trim());
    setInput('');
  };

  const handleStepAction = () => {
    const action = stepActions[currentStep];
    if (action?.needsCapture && onCaptureAndVerify) {
      onCaptureAndVerify();
    } else if (onStepAction) {
      onStepAction();
    }
  };

  // Show action button for steps 2-7
  const currentAction = stepActions[currentStep];
  const showActionButton = currentStep >= 2 && currentStep <= 7 && !isLoading && currentAction;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">AI Proctor Assistant</h2>
          <p className="text-xs text-muted-foreground">Monitoring your session</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm">
              Your AI Proctor will guide you through the check-in process.
            </p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 animate-fade-in",
              message.type === 'user' ? "flex-row-reverse" : "flex-row"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                message.type === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {message.type === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div className="flex flex-col max-w-[80%]">
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm",
                  message.type === 'user'
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                )}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div
                  className={cn(
                    "text-[10px] mt-1",
                    message.type === 'user'
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Bot className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      {/* Step Action Button */}
      {showActionButton && currentAction && (
        <div className="mb-4">
          <Button
            onClick={handleStepAction}
            className="w-full rounded-xl shadow-soft hover:shadow-medium transition-all duration-200 gap-2"
            size="lg"
          >
            {currentAction.icon}
            {currentAction.label}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {currentAction.description}
          </p>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={canSend ? "Type your response..." : "Complete the current step first..."}
          disabled={!canSend || isLoading}
          className="flex-1 rounded-full bg-muted border-border focus:ring-2 focus:ring-primary/20"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || !canSend || isLoading}
          className="rounded-full shadow-soft hover:shadow-medium transition-all duration-200"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
