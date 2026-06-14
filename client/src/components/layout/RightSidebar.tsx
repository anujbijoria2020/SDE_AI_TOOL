import React from 'react';
import { useChatStore } from '../../store/chatStore';
import ArtifactTabs from '../artifacts/ArtifactTabs';
import { X, FileCode2 } from 'lucide-react';
import Skeleton from '../ui/Skeleton';

const RightSidebar: React.FC = () => {
  const { activeProject, toggleRightSidebar, setArtifactOpen, isLoading } = useChatStore();

  const hasArtifacts = activeProject && activeProject.artifacts && activeProject.artifacts.length > 0;

  return (
    <div className="w-full h-screen flex flex-col bg-white border-l border-border-main overflow-hidden relative">
      {/* Header with Title & Close */}
      <div className="flex justify-between items-center px-4 py-3 bg-bg-sidebar border-b border-border-main shrink-0 select-none">
        <h2 className="text-sm font-semibold text-text-primary">Artifacts</h2>
        
        {/* Close button */}
        <button
          onClick={() => {
            toggleRightSidebar();
            setArtifactOpen(false);
          }}
          className="p-1 hover:bg-hover-bg rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          title="Close Panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Tab Render Body / Empty State */}
      <div className="flex-1 min-h-0 bg-white">
        {isLoading ? (
          <div className="w-full h-full flex flex-col p-4 gap-4 select-none">
            {/* Tabs skeleton */}
            <div className="flex gap-2 border-b border-border-main pb-2 shrink-0">
              <Skeleton variant="rect" className="w-16 h-7 rounded-lg bg-gray-200/80" />
              <Skeleton variant="rect" className="w-20 h-7 rounded-lg bg-gray-200/80" />
              <Skeleton variant="rect" className="w-24 h-7 rounded-lg bg-gray-200/80" />
            </div>
            {/* Content body skeleton */}
            <div className="flex-1 flex flex-col gap-3">
              <Skeleton variant="text" className="w-1/3 h-5 bg-gray-200/80" />
              <Skeleton variant="text" className="w-2/3 h-4 bg-gray-200/80" />
              <Skeleton variant="rect" className="w-full flex-1 rounded-xl bg-gray-200/70 min-h-[150px]" />
            </div>
          </div>
        ) : hasArtifacts ? (
          <div className="h-full overflow-y-auto border-l border-gray-200">
            <ArtifactTabs />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 select-none">
            <FileCode2 size={32} className="text-text-muted/60 mb-2.5 animate-pulse" />
            <p className="text-xs text-text-muted max-w-[200px] leading-relaxed">
              Generate a project to see artifacts here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
