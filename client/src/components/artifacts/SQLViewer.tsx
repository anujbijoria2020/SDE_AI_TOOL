import React, { useState } from 'react';
import { Copy, Check, Database, Download } from 'lucide-react';
import Button from '../ui/Button';

interface SQLViewerProps {
  sql: string;
}

const SQLViewer: React.FC<SQLViewerProps> = ({ sql }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schema.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lines = sql.trim().split('\n');

  return (
    <div className="flex flex-col h-full bg-white text-text-primary overflow-hidden border border-border-main rounded-xl shadow-xs">
      {/* SQL Header Bar */}
      <div className="flex justify-between items-center bg-bg-sidebar border-b border-border-main px-4 py-2 text-xs text-text-muted shrink-0 select-none">
        <span className="font-mono bg-blue-50 text-accent border border-blue-100 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1.5 font-semibold">
          <Database size={12} />
          SQL SCHEMA DDL
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2"
            leftIcon={copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
          >
            {copied ? 'Copied' : 'Copy SQL'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 px-2"
            leftIcon={<Download size={12} />}
          >
            Download .sql
          </Button>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 overflow-auto bg-[#0F1420] text-gray-200 font-mono text-xs p-4 select-text leading-relaxed">
        <pre className="flex">
          {/* Line Numbers */}
          <div className="text-gray-600 select-none text-right pr-4 border-r border-gray-800/65 flex flex-col shrink-0 min-w-[2.5rem]">
            {lines.map((_, i) => (
              <span key={i} className="block">
                {i + 1}
              </span>
            ))}
          </div>
          {/* Code Body */}
          <code className="pl-4 flex-1 whitespace-pre block text-left text-blue-200">
            {lines.map((line, i) => {
              // Basic color highlights for common SQL terms
              let highlightedLine = line
                .replace(/\b(CREATE TABLE|ALTER TABLE|DROP TABLE IF EXISTS|PRIMARY KEY|FOREIGN KEY|REFERENCES|ON DELETE|CASCADE|INT|VARCHAR|TEXT|TIMESTAMP|BOOLEAN|DATE|DATETIME|DEFAULT|NOT NULL|UNIQUE|INDEX)\b/g, 
                  '<span class="text-blue-400 font-semibold">$1</span>')
                .replace(/(--.*)/g, '<span class="text-gray-500 italic">$1</span>');

              return (
                <span 
                  key={i} 
                  className="block min-h-[1.2rem]"
                  dangerouslySetInnerHTML={{ __html: highlightedLine || ' ' }}
                />
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default SQLViewer;
