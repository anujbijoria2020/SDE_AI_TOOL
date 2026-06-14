import React from 'react';
import { Code2 } from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  const chips = [
    "E-commerce platform with cart and payments",
    "Food delivery app like Zomato",
    "Hospital management system",
    "Social media app with posts and chat"
  ];

  return (
    <div className="flex-1 flex flex-col justify-center items-center max-w-2xl mx-auto px-6 py-12 select-none">
      {/* App Logo */}
      <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-6 shadow-xs select-none">
        <Code2 size={28} />
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-text-primary text-center tracking-tight mb-2">
        Describe your project
      </h2>
      <p className="text-sm text-text-muted text-center leading-relaxed mb-8 max-w-md">
        I'll generate SRS, diagrams, and SQL schema for you
      </p>

      {/* Example Prompt Chips */}
      <div className="w-full max-w-lg flex flex-col items-center gap-3">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">
          Select a template to start
        </span>
        <div className="flex flex-wrap justify-center gap-2.5 w-full">
          {chips.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="px-4 py-2 bg-white hover:bg-hover-bg border border-border-main hover:border-accent/30 rounded-xl cursor-pointer shadow-2xs transition-all duration-200 hover:-translate-y-0.5 text-xs text-text-primary font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
