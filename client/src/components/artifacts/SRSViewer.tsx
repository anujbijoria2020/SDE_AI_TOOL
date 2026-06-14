import React, { useState } from 'react';
import type { SRS } from '../../types';
import { FileText, ShieldAlert, Award, Layers, Target, Eye, Copy, Check, Download, ChevronDown } from 'lucide-react';

interface SRSViewerProps {
  srs: SRS;
}

const SRSViewer: React.FC<SRSViewerProps> = ({ srs }) => {
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(srs, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const {
    project_title,
    purpose,
    scope,
    user_classes = [],
    functional_requirements = [],
    non_functional_requirements = [],
    constraints = [],
  } = srs;

  const handleDownloadPDF = () => {
    const printContent = document.querySelector('.printable-srs-container')?.innerHTML;
    if (!printContent) return;

    const printWindow = document.createElement('div');
    printWindow.id = 'print-section';
    printWindow.innerHTML = printContent;
    
    // Hide the toolbar buttons from the printed section
    const toolbar = printWindow.querySelector('.no-print');
    if (toolbar) {
      toolbar.remove();
    }

    document.body.appendChild(printWindow);
    document.body.classList.add('print-srs-active');

    window.print();

    document.body.classList.remove('print-srs-active');
    printWindow.remove();
  };

  const handleDownloadWord = () => {
    const srsHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #2563EB; font-size: 24px; border-bottom: 2px solid #E5E5E5; padding-bottom: 10px; margin-bottom: 20px;">
          ${project_title || 'Software Requirement Specification (SRS)'}
        </h1>
        
        <h2>1. Purpose</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #1A1A1A;">${purpose || 'N/A'}</p>
        
        <h2>2. Scope</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #1A1A1A;">${scope || 'N/A'}</p>
        
        <h2>3. User Classes & Characteristics</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #1A1A1A;">
          ${user_classes.length > 0 ? user_classes.join(', ') : 'N/A'}
        </p>
        
        <h2>4. Functional Requirements</h2>
        <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
          <thead>
            <tr style="background-color: #F7F7F8; font-weight: bold;">
              <th align="left" style="width: 15%;">ID</th>
              <th align="left" style="width: 30%;">Title</th>
              <th align="left">Description</th>
            </tr>
          </thead>
          <tbody>
            ${functional_requirements.map(req => `
              <tr>
                <td style="font-family: monospace; font-weight: bold; color: #2563EB;">${req.id}</td>
                <td style="font-weight: bold;">${req.title}</td>
                <td style="color: #6B6B6B;">${req.description}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h2>5. Non-Functional Requirements</h2>
        <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
          <thead>
            <tr style="background-color: #F7F7F8; font-weight: bold;">
              <th align="left" style="width: 15%;">ID</th>
              <th align="left" style="width: 30%;">Type</th>
              <th align="left">Description</th>
            </tr>
          </thead>
          <tbody>
            ${non_functional_requirements.map(req => `
              <tr>
                <td style="font-family: monospace; font-weight: bold; color: #2563EB;">${req.id}</td>
                <td style="font-weight: bold;">${req.type}</td>
                <td style="color: #6B6B6B;">${req.description}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h2>6. Design & Implementation Constraints</h2>
        <ul style="font-size: 14px; line-height: 1.6; color: #1A1A1A; padding-left: 20px;">
          ${constraints.map(constraint => `<li>${constraint}</li>`).join('')}
        </ul>
      </div>
    `;

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>SRS Document</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + srsHtml + footer;

    const blob = new Blob([sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(project_title || 'srs-document').toLowerCase().replace(/\s+/g, '-')}-srs.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white text-text-primary overflow-y-auto select-text p-6 printable-srs-container">
      {/* Title & Actions */}
      <div className="flex justify-between items-start border-b border-border-main pb-4 mb-6 shrink-0 gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-accent p-2 rounded-lg">
            <FileText size={20} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            {project_title || 'Software Requirement Specification (SRS)'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border-main hover:bg-hover-bg/40 text-text-primary text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs shrink-0"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy as JSON'}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border-main hover:bg-hover-bg/40 text-text-primary text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs shrink-0"
            >
              <Download size={14} />
              <span>Export</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-40 bg-white border border-border-main rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                  <button
                    onClick={() => {
                      handleDownloadPDF();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-text-primary hover:bg-hover-bg/50 transition-colors font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <FileText size={12} className="text-red-500" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDownloadWord();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-text-primary hover:bg-hover-bg/50 transition-colors font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <FileText size={12} className="text-blue-500" />
                    <span>Download Word</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 max-w-3xl">
        {/* Purpose & Scope */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {purpose && (
            <div className="p-4 rounded-xl border border-border-main bg-hover-bg/30">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2 mb-2">
                <Target size={14} className="text-accent" />
                1. Purpose
              </h3>
              <p className="text-sm text-text-primary leading-relaxed">{purpose}</p>
            </div>
          )}
          {scope && (
            <div className="p-4 rounded-xl border border-border-main bg-hover-bg/30">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2 mb-2">
                <Eye size={14} className="text-accent" />
                2. Scope
              </h3>
              <p className="text-sm text-text-primary leading-relaxed">{scope}</p>
            </div>
          )}
        </div>

        {/* User Classes */}
        {user_classes && user_classes.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2 mb-3">
              <Award size={14} className="text-accent" />
              3. User Classes & Characteristics
            </h3>
            <div className="flex flex-wrap gap-2">
              {user_classes.map((cls, index) => (
                <span 
                  key={index} 
                  className="bg-hover-bg border border-border-main text-text-primary px-3 py-1 rounded-full text-xs font-medium"
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Functional Requirements */}
        {functional_requirements && functional_requirements.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2 mb-3">
              <Layers size={14} className="text-accent" />
              4. Functional Requirements
            </h3>
            <div className="border border-border-main rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-bg-sidebar border-b border-border-main">
                    <th className="p-3 font-semibold text-xs text-text-muted uppercase w-20">ID</th>
                    <th className="p-3 font-semibold text-xs text-text-muted uppercase w-40">Title</th>
                    <th className="p-3 font-semibold text-xs text-text-muted uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main bg-white">
                  {functional_requirements.map((req) => (
                    <tr key={req.id} className="hover:bg-hover-bg/20 transition-colors">
                      <td className="p-3 font-mono text-xs font-bold text-accent align-top">
                        {req.id}
                      </td>
                      <td className="p-3 font-semibold text-text-primary align-top">
                        {req.title}
                      </td>
                      <td className="p-3 text-text-muted leading-relaxed align-top">
                        {req.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Non-Functional Requirements */}
        {non_functional_requirements && non_functional_requirements.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2 mb-3">
              <ShieldAlert size={14} className="text-accent" />
              5. Non-Functional Requirements
            </h3>
            <div className="border border-border-main rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-bg-sidebar border-b border-border-main">
                    <th className="p-3 font-semibold text-xs text-text-muted uppercase w-20">ID</th>
                    <th className="p-3 font-semibold text-xs text-text-muted uppercase w-40">Type</th>
                    <th className="p-3 font-semibold text-xs text-text-muted uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main bg-white">
                  {non_functional_requirements.map((req) => (
                    <tr key={req.id} className="hover:bg-hover-bg/20 transition-colors">
                      <td className="p-3 font-mono text-xs font-bold text-accent align-top">
                        {req.id}
                      </td>
                      <td className="p-3 font-semibold text-text-primary align-top">
                        {req.type}
                      </td>
                      <td className="p-3 text-text-muted leading-relaxed align-top">
                        {req.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Constraints */}
        {constraints && constraints.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2 mb-3">
              <Layers size={14} className="text-accent" />
              6. Design & Implementation Constraints
            </h3>
            <ul className="list-disc pl-5 text-sm text-text-muted flex flex-col gap-2 leading-relaxed">
              {constraints.map((constraint, index) => (
                <li key={index} className="pl-1">
                  <span className="text-text-primary">{constraint}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SRSViewer;
