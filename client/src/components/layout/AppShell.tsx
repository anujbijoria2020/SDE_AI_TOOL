import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileDrawer from './MobileDrawer';
import { Menu, PanelRight } from 'lucide-react';

const AppShell: React.FC = () => {
  const {
    leftSidebarOpen,
    rightSidebarOpen,
    toggleLeftSidebar,
    toggleRightSidebar,
    activeProject,
    sidebarCollapsed,
    artifactOpen,
  } = useChatStore();

  // Media query listener to detect mobile vs tablet and 2xl screens
  const [isMobile, setIsMobile] = useState(false);
  const [is2Xl, setIs2Xl] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const media2Xl = window.matchMedia('(min-width: 1536px)');
    
    setIsMobile(media.matches);
    setIs2Xl(media2Xl.matches);
    
    const listener = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    const listener2Xl = (e: MediaQueryListEvent) => {
      setIs2Xl(e.matches);
    };
    
    media.addEventListener('change', listener);
    media2Xl.addEventListener('change', listener2Xl);
    
    return () => {
      media.removeEventListener('change', listener);
      media2Xl.removeEventListener('change', listener2Xl);
    };
  }, []);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus chat input
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
          (chatInput as HTMLTextAreaElement).focus();
        }
      }

      // Escape key to close open mobile drawers
      if (e.key === 'Escape') {
        if (leftSidebarOpen) {
          toggleLeftSidebar();
        }
        if (rightSidebarOpen) {
          toggleRightSidebar();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar]);

  const leftColExpandedWidth = is2Xl ? '280px' : '260px';
  const rightColExpandedWidth = is2Xl ? '480px' : '420px';

  const leftColWidth = sidebarCollapsed ? '80px' : leftColExpandedWidth;
  const rightColWidth = artifactOpen ? rightColExpandedWidth : '0px';

  const gridStyle = {
    '--left-sidebar-width': leftColWidth,
    '--right-sidebar-width': rightColWidth,
  } as React.CSSProperties;

  const artifactCount = activeProject?.artifacts?.length || 0;

  return (
    <div 
      className="w-screen h-screen grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[var(--left-sidebar-width)_1fr_var(--right-sidebar-width)] overflow-hidden bg-white text-text-primary relative transition-all duration-300"
      style={gridStyle}
    >
      {/* Left Sidebar */}
      <aside className="hidden md:block h-full border-r border-border-main bg-bg-sidebar overflow-hidden">
        <LeftSidebar />
      </aside>

      {/* Center Content Container */}
      <main className="h-full min-w-0 bg-white flex flex-col overflow-hidden relative">
        {/* Mobile-only Top Header Bar (hidden on lg+) */}
        <header className="h-14 bg-bg-sidebar border-b border-border-main flex items-center justify-between px-4 shrink-0 select-none lg:hidden relative">
          {/* Left: Hamburger menu */}
          <button
            onClick={toggleLeftSidebar}
            className="p-1.5 hover:bg-hover-bg rounded-lg text-text-muted hover:text-text-primary cursor-pointer z-10"
            title="Open Projects"
          >
            <Menu size={18} />
          </button>

          {/* Center: Centered app title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-16">
            <span className="font-semibold text-sm text-text-primary truncate">
              {activeProject ? activeProject.title : 'SE Assistant'}
            </span>
          </div>

          {/* Right: Artifacts icon button with badge */}
          <div className="z-10 flex items-center h-full">
            {activeProject && artifactCount > 0 && (
              <button
                onClick={toggleRightSidebar}
                className="p-1.5 hover:bg-hover-bg rounded-lg text-text-muted hover:text-text-primary cursor-pointer relative"
                title="View Artifacts"
              >
                <PanelRight size={18} />
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white w-4.5 h-4.5 rounded-full text-[9px] font-bold flex items-center justify-center border border-white">
                  {artifactCount}
                </span>
              </button>
            )}
          </div>
        </header>
        <div className="flex-1 min-h-0 relative">
          <Outlet />
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="hidden lg:block h-full border-l border-border-main bg-white overflow-hidden">
        <RightSidebar />
      </aside>

      {/* Mobile Drawer (Left Sidebar) */}
      <div className="md:hidden">
        <MobileDrawer isOpen={leftSidebarOpen} onClose={toggleLeftSidebar} side="left">
          <LeftSidebar />
        </MobileDrawer>
      </div>

      {/* Tablet Slide-over / Mobile Slide-up (Right Sidebar) */}
      <div className="lg:hidden">
        <MobileDrawer 
          isOpen={rightSidebarOpen} 
          onClose={toggleRightSidebar} 
          side={isMobile ? 'bottom' : 'right'}
        >
          <RightSidebar />
        </MobileDrawer>
      </div>
    </div>
  );
};

export default AppShell;
