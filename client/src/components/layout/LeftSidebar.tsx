import React from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuth } from '../../context/AuthContext';
import NewChatButton from '../sidebar/NewChatButton';
import ProjectListItem from '../sidebar/ProjectListItem';
import Skeleton from '../ui/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '../../api/projects';
import type { ProjectListItem as ProjectListItemData } from '../../types';
import { LogOut, User as UserIcon, Code2, Compass, PanelLeftClose, PanelLeftOpen, AlertCircle } from 'lucide-react';

interface GroupedProjects {
  Today: ProjectListItemData[];
  Yesterday: ProjectListItemData[];
  Older: ProjectListItemData[];
}

const groupProjects = (projectsList: ProjectListItemData[]): GroupedProjects => {
  const groups: GroupedProjects = { Today: [], Yesterday: [], Older: [] };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  projectsList.forEach((proj) => {
    const projDate = new Date(proj.created_at);
    projDate.setHours(0, 0, 0, 0);

    if (projDate.getTime() === today.getTime()) {
      groups.Today.push(proj);
    } else if (projDate.getTime() === yesterday.getTime()) {
      groups.Yesterday.push(proj);
    } else {
      groups.Older.push(proj);
    }
  });

  return groups;
};

const LeftSidebar: React.FC = () => {
  const { activeProjectId, sidebarCollapsed, setSidebarCollapsed } = useChatStore();
  const { user, logout } = useAuth();

  const { data: projects = [], isLoading, isError, refetch } = useQuery<ProjectListItemData[]>({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  // Sort and group projects
  const sortedProjects = [...projects].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const grouped = groupProjects(sortedProjects);

  return (
    <div className="w-full h-full flex flex-col bg-bg-sidebar border-r border-border-main select-none">
      {/* Brand Header */}
      <div className={`p-4 border-b border-border-main flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="bg-accent text-white p-1.5 rounded-lg flex items-center justify-center shadow-xs">
              <Code2 size={20} />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary tracking-tight">SE Assistant</h1>
              <p className="text-[10px] text-text-muted">Software Studio</p>
            </div>
          </div>
        )}

        {sidebarCollapsed ? (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="p-1 hover:bg-hover-bg rounded-lg text-text-muted hover:text-text-primary cursor-pointer"
            title="Expand Sidebar"
          >
            <PanelLeftOpen size={16} />
          </button>
        ) : (
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="p-1 hover:bg-hover-bg rounded-lg text-text-muted hover:text-text-primary hidden lg:block cursor-pointer"
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {/* Primary Actions Area */}
      <div className="p-4 shrink-0">
        <NewChatButton />
      </div>

      {/* Project History Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton variant="rect" className="w-4 h-4 bg-gray-200/80 shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton variant="text" className="w-5/6 h-3 bg-gray-200/80" />
                  <Skeleton variant="text" className="w-1/2 h-2 bg-gray-200/80" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          sidebarCollapsed ? (
            <div className="flex items-center justify-center py-4" title="Failed to load projects">
              <button 
                onClick={() => refetch()}
                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer transition-colors border border-red-100"
              >
                <AlertCircle size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 border border-red-100 rounded-lg bg-red-50/20 gap-2">
              <AlertCircle size={20} className="text-red-500" />
              <p className="text-[11px] text-red-600 text-center leading-normal">
                Failed to load projects.
              </p>
              <button
                onClick={() => refetch()}
                className="mt-1 px-3 py-1 bg-accent hover:bg-accent/90 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                Retry
              </button>
            </div>
          )
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-2 border border-dashed border-border-main rounded-lg bg-white/40">
            <Compass size={24} className="text-text-muted/60 mb-2" />
            <p className="text-[11px] text-text-muted text-center leading-normal">
              No projects yet.<br />Start a new chat!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Object.entries(grouped).map(([groupName, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={groupName} className="flex flex-col gap-1">
                  {!sidebarCollapsed && (
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 px-1">
                      {groupName}
                    </h3>
                  )}
                  {items.map((project: ProjectListItemData) => (
                    <ProjectListItem
                      key={project.id}
                      project={project}
                      isActive={project.id === activeProjectId}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Footer Panel */}
      {user && (
        <div className={`p-4 border-t border-border-main bg-white/60 flex shrink-0 ${
          sidebarCollapsed ? 'flex-col items-center gap-3 justify-center' : 'items-center justify-between'
        }`}>
          <div className={`flex items-center gap-2.5 overflow-hidden ${sidebarCollapsed ? 'w-auto' : 'w-[75%]'}`}>
            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <UserIcon size={14} className="text-accent" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden flex flex-col items-start w-full">
                <span className="text-xs font-semibold text-text-primary truncate w-full text-left">
                  {user.email.split('@')[0]}
                </span>
                <span className="text-[9px] text-text-muted truncate w-full text-left" title={user.email}>
                  {user.email}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-text-muted transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default LeftSidebar;
