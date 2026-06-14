import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import Spinner from '../ui/Spinner';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading, initialValue = '' }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
      // Focus and adjust height
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }
  }, [initialValue]);

  // Auto-resize textarea height as text flows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSubmit(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full bg-white select-none shrink-0 border-t border-border-main/50">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex flex-col border border-border-main focus-within:border-accent focus-within:ring-1 focus-within:ring-accent rounded-2xl bg-white shadow-2xs p-1.5 transition-all duration-200">
          <textarea
            ref={textareaRef}
            id="chat-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your software project..."
            className="w-full resize-none bg-transparent py-2 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none min-h-[44px] max-h-[200px]"
            disabled={isLoading}
          />
          <div className="flex justify-between items-center px-3 pb-1 pt-1 border-t border-gray-50 select-none">
            <div className="text-[10px] text-text-muted font-medium">
              {input.length > 0 && `${input.length} characters`}
            </div>
            
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isLoading || !input.trim()
                  ? 'bg-hover-bg text-text-muted cursor-not-allowed'
                  : 'bg-accent text-white hover:bg-accent-hover active:scale-95 shadow-sm'
              }`}
            >
              {isLoading ? (
                <Spinner className="w-3.5 h-3.5 text-white" />
              ) : (
                <ArrowUp size={14} />
              )}
            </button>
          </div>
        </div>
        <p className="text-[9px] text-text-muted mt-2 text-center select-none leading-normal">
          Press <kbd className="font-mono bg-hover-bg px-1 py-0.5 rounded border border-border-main">Enter</kbd> to submit, <kbd className="font-mono bg-hover-bg px-1 py-0.5 rounded border border-border-main">Shift + Enter</kbd> for a new line.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
