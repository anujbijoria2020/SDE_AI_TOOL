import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import Spinner from '../ui/Spinner';
import { AlertCircle, Download, ZoomIn, ZoomOut, Eye, Code, Copy, Check } from 'lucide-react';
import Button from '../ui/Button';

interface MermaidDiagramProps {
  code: string;
  title: string;
}

function sanitizeMermaidCode(raw: string): string {
  let cleaned = raw;
  
  // If the string is still JSON-encoded (starts/ends with quotes), 
  // try parsing it as JSON to unescape properly
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    try {
      cleaned = JSON.parse(cleaned);
    } catch {
      // fallback to manual replace if JSON.parse fails
    }
  }
  
  // Manual fallback: replace literal \n and \" with real characters
  cleaned = cleaned
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
  
  return cleaned.trim();
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code, title }) => {
  const [svg, setSvg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate a unique ID per render to avoid mermaid conflicts
  const [uniqueId, setUniqueId] = useState('');

  const sanitizedCode = sanitizeMermaidCode(code);

  useEffect(() => {
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '-');
    const randomSuffix = Math.floor(Math.random() * 1000000);
    setUniqueId(`mermaid-${sanitizedTitle}-${randomSuffix}`);
  }, [sanitizedCode, title]);

  const handleCopy = () => {
    navigator.clipboard.writeText(sanitizedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-diagram.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.4));
  const handleResetZoom = () => setZoom(1);

  useEffect(() => {
    if (!uniqueId) return;

    let active = true;
    setLoading(true);
    setError(null);
    setSvg('');

    const renderDiagram = async () => {
      try {
        // Clear any old elements in DOM
        const oldEl = document.getElementById(`d${uniqueId}`);
        if (oldEl) oldEl.remove();

        const { svg: svgOutput } = await mermaid.render(`d${uniqueId}`, sanitizedCode);
        
        if (active) {
          setSvg(svgOutput);
          setError(null);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        if (active) {
          setError(err.message || 'Syntax error compiling Mermaid diagram.');
          setLoading(false);
        }
        const oldEl = document.getElementById(`d${uniqueId}`);
        if (oldEl) oldEl.remove();
      }
    };

    const timer = setTimeout(() => {
      renderDiagram();
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [sanitizedCode, uniqueId]);

  return (
    <div className="flex flex-col h-full bg-bg-sidebar/30 border border-border-main rounded-xl overflow-hidden shadow-xs relative">
      {/* Control Bar */}
      <div className="flex justify-between items-center bg-white border-b border-border-main px-4 py-2 text-xs text-text-muted shrink-0 z-10 select-none">
        <span className="font-mono bg-hover-bg px-2 py-0.5 rounded-md text-[10px] uppercase font-bold text-text-muted">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {/* Zoom controls (hidden if code mode or error/loading) */}
          {!showCode && !error && !loading && (
            <div className="flex items-center border border-border-main rounded-md overflow-hidden bg-white mr-2">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-hover-bg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2 py-1 hover:bg-hover-bg text-[10px] font-semibold border-x border-border-main transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-hover-bg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          )}

          {/* View Code Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCode(!showCode)}
            className="h-7 px-2"
            leftIcon={showCode ? <Eye size={12} /> : <Code size={12} />}
          >
            {showCode ? 'View Diagram' : 'View Code'}
          </Button>

          {/* Copy Button (only in code mode) */}
          {showCode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2"
              leftIcon={copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          )}

          {/* Download SVG Button */}
          {!showCode && !error && !loading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-7 px-2"
              leftIcon={<Download size={12} />}
            >
              SVG
            </Button>
          )}
        </div>
      </div>

      {/* Render Canvas / Code View */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden bg-white">
        {showCode || error ? (
          <div className="w-full h-full text-left flex flex-col gap-3 overflow-hidden select-text">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl shrink-0 select-none">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div className="flex-1 flex flex-col gap-1">
                  <span className="font-semibold">Visual rendering failed. Showing raw diagram markup instead.</span>
                  <span className="text-[10px] text-red-500 font-mono leading-normal opacity-85">{error}</span>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-auto scrollbar-thin">
              <pre className="text-xs bg-bg-sidebar border border-border-main p-4 rounded-xl font-mono leading-relaxed max-h-full overflow-y-auto">
                {sanitizedCode}
              </pre>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center gap-3 select-none">
            <Spinner className="text-accent animate-spin" />
            <span className="text-xs text-text-muted">Rendering diagram canvas...</span>
          </div>
        ) : svg ? (
          <div 
            ref={containerRef}
            className="w-full h-full flex items-center justify-center overflow-auto scrollbar-thin select-none"
          >
            <div 
              className="transition-transform duration-100 ease-out origin-center cursor-grab active:cursor-grabbing w-full [&_svg]:w-full [&_svg]:h-auto"
              style={{ transform: `scale(${zoom})` }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MermaidDiagram;
