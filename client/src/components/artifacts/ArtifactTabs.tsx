import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import SRSViewer from './SRSViewer';
import MermaidDiagram from './MermaidDiagram';
import SQLViewer from './SQLViewer';
import Skeleton from '../ui/Skeleton';
import { FileText, GitFork, Milestone, ArrowRightLeft, Database } from 'lucide-react';

type TabType = 'srs' | 'erd' | 'class' | 'sequence' | 'sql';

const ArtifactTabs: React.FC = () => {
  const { artifacts, isGenerating } = useChatStore();
  const [activeTab, setActiveTab] = useState<TabType>('srs');

  // Reset tab to 'srs' if active project changes
  useEffect(() => {
    setActiveTab('srs');
  }, [artifacts]);

  // Loading skeleton state
  if (isGenerating || !artifacts) {
    return (
      <div className="flex flex-col h-full bg-white select-none">
        {/* Skeleton Tabs list bar */}
        <div className="flex border-b border-border-main bg-bg-sidebar px-2 shrink-0 overflow-x-auto scrollbar-none gap-2 py-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rect" className="w-24 h-8 bg-gray-200/80 shrink-0" />
          ))}
        </div>
        {/* Skeleton Tabs Viewport Content */}
        <div className="flex-1 p-6 flex flex-col gap-4">
          <Skeleton variant="text" className="w-1/3 h-6 bg-gray-200/80" />
          <Skeleton variant="rect" className="w-full h-40 bg-gray-200/80" />
          <Skeleton variant="text" className="w-full h-4 bg-gray-200/80" />
          <Skeleton variant="text" className="w-5/6 h-4 bg-gray-200/80" />
          <Skeleton variant="text" className="w-2/3 h-4 bg-gray-200/80" />
        </div>
      </div>
    );
  }

  const tabsConfig = [
    { id: 'srs', label: 'SRS', icon: <FileText size={14} />, exists: !!artifacts.srs },
    { id: 'erd', label: 'ER Diagram', icon: <GitFork size={14} />, exists: !!artifacts.erd_mermaid },
    { id: 'class', label: 'Class Diagram', icon: <Milestone size={14} />, exists: !!artifacts.class_diagram_mermaid },
    { id: 'sequence', label: 'Sequence Diagram', icon: <ArrowRightLeft size={14} />, exists: !!artifacts.sequence_diagram_mermaid },
    { id: 'sql', label: 'SQL Schema', icon: <Database size={14} />, exists: !!artifacts.sql_schema },
  ] as const;

  const availableTabs = tabsConfig.filter((t) => t.exists);

  // Ensure selected tab actually exists
  const currentTab = availableTabs.some((t) => t.id === activeTab)
    ? activeTab
    : availableTabs[0]?.id || 'srs';

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Tabs list bar (horizontal scrollable on mobile) */}
      <div className="flex border-b border-border-main bg-bg-sidebar px-2 shrink-0 overflow-x-auto scrollbar-none">
        {availableTabs.map((tab) => {
          const isSelected = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'border-accent text-accent bg-white'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:bg-hover-bg/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tabs active viewport container */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-white">
        {currentTab === 'srs' && artifacts.srs && (
          <SRSViewer srs={artifacts.srs} />
        )}
        
        {currentTab === 'erd' && artifacts.erd_mermaid && (
          <div className="p-4 h-full">
            <MermaidDiagram title="ER Diagram" code={artifacts.erd_mermaid} />
          </div>
        )}

        {currentTab === 'class' && artifacts.class_diagram_mermaid && (
          <div className="p-4 h-full">
            <MermaidDiagram title="Class Diagram" code={artifacts.class_diagram_mermaid} />
          </div>
        )}

        {currentTab === 'sequence' && artifacts.sequence_diagram_mermaid && (
          <div className="p-4 h-full">
            <MermaidDiagram title="Sequence Diagram" code={artifacts.sequence_diagram_mermaid} />
          </div>
        )}

        {currentTab === 'sql' && artifacts.sql_schema && (
          <div className="p-4 h-full">
            <SQLViewer sql={artifacts.sql_schema} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtifactTabs;
