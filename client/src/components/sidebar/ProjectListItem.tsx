import React, { useState } from 'react';
import type { ProjectListItem as ProjectListItemData } from '../../types';
import { FileText, Trash2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProject as deleteProjectApi } from '../../api/projects';
import { useChatStore } from '../../store/chatStore';
import { useToastStore } from '../../store/toastStore';
import ConfirmModal from '../ui/ConfirmModal';

interface ProjectListItemProps {
  project: ProjectListItemData;
  isActive: boolean;
}

const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, isActive }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeProjectId, clearActiveProject, sidebarCollapsed } = useChatStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: deleteProjectApi,
    onSuccess: () => {
      // Trigger success notification
      useToastStore.getState().showToast("Project deleted", "success");

      // Optimistic update of the cache without refetching
      queryClient.setQueryData(['projects'], (old: ProjectListItemData[] | undefined) => {
        return old ? old.filter((p) => p.id !== project.id) : [];
      });

      // If deleted project was active, navigate to '/' and clear chatStore
      if (activeProjectId === project.id) {
        clearActiveProject();
        navigate('/');
      }
    },
    onError: (err) => {
      console.error('Failed to delete project:', err);
      let errorMessage = "Failed to delete project";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      const axiosError = err as { response?: { data?: { detail?: string } } };
      if (axiosError.response?.data?.detail) {
        errorMessage = axiosError.response.data.detail;
      }
      useToastStore.getState().showToast(errorMessage, "error");
    },
  });

  const handleSelect = () => {
    navigate(`/chat/${project.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering selection
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(project.id, {
      onSuccess: () => {
        setShowConfirm(false);
      },
    });
  };

  if (sidebarCollapsed) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200 border border-transparent mx-auto w-10 h-10 shrink-0 ${
          isActive
            ? 'bg-hover-bg border-border-main text-accent'
            : 'text-text-muted hover:bg-hover-bg/50 hover:text-text-primary'
        }`}
        onClick={handleSelect}
        title={project.title}
      >
        <FileText size={16} className={isActive ? 'text-accent' : 'text-text-muted'} />
      </div>
    );
  }

  return (
    <>
      <div
        className={`group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent ${
          isActive
            ? 'bg-hover-bg border-border-main text-text-primary shadow-xs'
            : 'text-text-muted hover:bg-hover-bg/50 hover:text-text-primary'
        }`}
        onClick={handleSelect}
      >
        <div className="flex items-start gap-2.5 overflow-hidden w-[82%]">
          <FileText 
            size={16} 
            className={`mt-0.5 shrink-0 ${isActive ? 'text-accent' : 'text-text-muted'}`} 
          />
          <div className="overflow-hidden flex flex-col items-start w-full">
            <span className="text-sm font-medium line-clamp-2 w-full text-left">
              {project.title}
            </span>
            <span className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
              <Calendar size={10} />
              {getRelativeTime(project.created_at)}
            </span>
          </div>
        </div>

        {/* Hover Delete Action Button */}
        <button
          onClick={handleDeleteClick}
          className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md transition-all text-text-muted cursor-pointer"
          title="Delete Project"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.title}"? This action cannot be undone and will permanently remove all associated software specifications, diagrams, and SQL schema files.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onClose={() => setShowConfirm(false)}
        isLoading={deleteMutation.isPending}
        confirmButtonVariant="danger"
      />
    </>
  );
};

export default ProjectListItem;
