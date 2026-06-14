import { create } from 'zustand';
import type { ProjectListItem, ProjectOut, Message, GeneratedArtifacts, SRS } from '../types';
import * as projectsApi from '../api/projects';
import * as generateApi from '../api/generate';
import { queryClient } from '../api/queryClient';
import { useToastStore } from './toastStore';

interface ChatState {
  projects: ProjectListItem[];
  activeProject: ProjectOut | null;
  messages: Message[];
  isLoading: boolean;
  sidebarOpen: boolean; // desktop sidebar
  artifactOpen: boolean; // desktop right panel
  
  // New States
  activeProjectId: number | null;
  artifacts: GeneratedArtifacts | null;
  isGenerating: boolean;
  rightSidebarOpen: boolean; // mobile right sidebar
  leftSidebarOpen: boolean; // mobile left sidebar

  loadProjects: () => Promise<void>;
  setActiveProject: (projectOrId: ProjectOut | number | null, artifactsData?: GeneratedArtifacts | null) => void;
  clearActiveProject: () => void;
  setGenerating: (bool: boolean) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  startNewChat: () => void;
  deleteProject: (id: number) => Promise<void>;
  generateProject: (description: string, onSuccess?: () => void) => Promise<void>;
  setSidebarOpen: (open: boolean) => void;
  setArtifactOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  projects: [],
  activeProject: null,
  messages: [],
  isLoading: false,
  sidebarOpen: true,
  artifactOpen: false,

  // New states initial values
  activeProjectId: null,
  artifacts: null,
  isGenerating: false,
  rightSidebarOpen: false,
  leftSidebarOpen: false,
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',

  loadProjects: async () => {
    try {
      const projects = await projectsApi.getProjects();
      // Sort projects by created_at descending (newest first)
      const sorted = [...projects].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      set({ projects: sorted });
    } catch (error) {
      console.error('Failed to load projects:', error);
      let errorMessage = "Failed to load projects";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      const axiosError = error as { response?: { data?: { detail?: string } } };
      if (axiosError.response?.data?.detail) {
        errorMessage = axiosError.response.data.detail;
      }
      useToastStore.getState().showToast(errorMessage, "error");
    }
  },

  setActiveProject: (projectOrId: ProjectOut | number | null, artifactsData?: GeneratedArtifacts | null) => {
    if (!projectOrId) {
      set({ 
        activeProject: null, 
        activeProjectId: null, 
        artifacts: null,
        messages: [], 
        artifactOpen: false,
        rightSidebarOpen: false,
      });
      return;
    }

    let resolvedProject: ProjectOut;
    let resolvedId: number;
    let resolvedArtifacts: GeneratedArtifacts;

    if (typeof projectOrId === 'number') {
      resolvedId = projectOrId;
      resolvedArtifacts = artifactsData || {
        srs: { project_title: '', purpose: '', scope: '', user_classes: [], functional_requirements: [], non_functional_requirements: [], constraints: [] },
        erd_mermaid: '',
        class_diagram_mermaid: '',
        sequence_diagram_mermaid: '',
        sql_schema: '',
      };
      
      resolvedProject = {
        id: resolvedId,
        title: 'Generated Project',
        description: '',
        user_id: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        artifacts: [
          { id: 1, project_id: resolvedId, artifact_type: 'srs', content: JSON.stringify(resolvedArtifacts.srs), created_at: '' },
          { id: 2, project_id: resolvedId, artifact_type: 'erd_mermaid', content: resolvedArtifacts.erd_mermaid, created_at: '' },
          { id: 3, project_id: resolvedId, artifact_type: 'class_diagram_mermaid', content: resolvedArtifacts.class_diagram_mermaid, created_at: '' },
          { id: 4, project_id: resolvedId, artifact_type: 'sequence_diagram_mermaid', content: resolvedArtifacts.sequence_diagram_mermaid, created_at: '' },
          { id: 5, project_id: resolvedId, artifact_type: 'sql_schema', content: resolvedArtifacts.sql_schema, created_at: '' },
        ]
      };
    } else {
      resolvedProject = projectOrId;
      resolvedId = projectOrId.id;

      const srsRaw = resolvedProject.artifacts.find(a => a.artifact_type === 'srs')?.content;
      let srs: SRS | null = null;
      if (srsRaw) {
        try {
          srs = JSON.parse(srsRaw);
        } catch (e) {
          console.error("Failed to parse SRS JSON", e);
        }
      }

      resolvedArtifacts = {
        srs: srs || { project_title: '', purpose: '', scope: '', user_classes: [], functional_requirements: [], non_functional_requirements: [], constraints: [] },
        erd_mermaid: resolvedProject.artifacts.find(a => a.artifact_type === 'erd_mermaid')?.content || '',
        class_diagram_mermaid: resolvedProject.artifacts.find(a => a.artifact_type === 'class_diagram_mermaid')?.content || '',
        sequence_diagram_mermaid: resolvedProject.artifacts.find(a => a.artifact_type === 'sequence_diagram_mermaid')?.content || '',
        sql_schema: resolvedProject.artifacts.find(a => a.artifact_type === 'sql_schema')?.content || '',
      };
    }

    const userMessage: Message = {
      id: `user-${resolvedId}`,
      role: 'user',
      content: resolvedProject.description || 'Project Requirements',
      timestamp: new Date(resolvedProject.created_at),
    };

    const assistantMessage: Message = {
      id: `assistant-${resolvedId}`,
      role: 'assistant',
      content: `I have successfully retrieved the generated software architecture artifacts for **${resolvedProject.title}**. You can inspect the SRS, ERD, Class Diagrams, Sequence Flows, and SQL Schemas in the right-hand panel.`,
      timestamp: new Date(resolvedProject.created_at),
    };

    set({
      activeProject: resolvedProject,
      activeProjectId: resolvedId,
      artifacts: resolvedArtifacts,
      messages: [userMessage, assistantMessage],
      artifactOpen: true,
    });
  },

  clearActiveProject: () => {
    set({
      activeProject: null,
      activeProjectId: null,
      artifacts: null,
      messages: [],
      artifactOpen: false,
      rightSidebarOpen: false,
      leftSidebarOpen: false,
    });
  },

  setGenerating: (bool: boolean) => {
    set({ isGenerating: bool, isLoading: bool });
  },

  toggleLeftSidebar: () => {
    set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen }));
  },

  toggleRightSidebar: () => {
    set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen }));
  },

  startNewChat: () => {
    set({
      activeProject: null,
      activeProjectId: null,
      artifacts: null,
      messages: [],
      artifactOpen: false,
      rightSidebarOpen: false,
      leftSidebarOpen: false,
    });
  },

  deleteProject: async (id: number) => {
    try {
      await projectsApi.deleteProject(id);
      
      const { projects, activeProjectId } = get();
      const updatedProjects = projects.filter((p) => p.id !== id);
      
      set({ projects: updatedProjects });

      if (activeProjectId === id) {
        get().startNewChat();
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  },

  generateProject: async (description: string, onSuccess?: () => void) => {
    const userMsgId = `user-temp-${Date.now()}`;
    const assistantMsgId = `assistant-temp-${Date.now()}`;

    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: description,
      timestamp: new Date(),
    };

    set((state) => ({
      isLoading: true,
      isGenerating: true,
      activeProject: null,
      activeProjectId: null,
      artifacts: null,
      messages: [...state.messages, userMessage],
      artifactOpen: false, // Hide artifact panel while generating
      rightSidebarOpen: false,
    }));

    try {
      // Step 1: Call API to generate
      const response = await generateApi.generateArtifacts(description);
      
      const projectId = response["Project ID"];

      if (!projectId) {
        throw new Error("Project ID was not returned");
      }

      // Step 2: Fetch the fully populated project from backend
      const project = await projectsApi.getProject(projectId);
      
      // Step 3: Refresh projects list
      const { projects } = get();
      const projectItem: ProjectListItem = {
        id: project.id,
        title: project.title,
        description: project.description,
        created_at: project.created_at,
      };
      const updatedProjects = [projectItem, ...projects.filter((p) => p.id !== project.id)];

      // Update React Query cache
      queryClient.setQueryData(['projects'], (old: ProjectListItem[] | undefined) => {
        if (!old) return [projectItem];
        return [projectItem, ...old.filter((p) => p.id !== project.id)];
      });

      const assistantMessage: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: `I have analyzed your prompt and generated the requested software designs!

I created the **Software Requirements Specification (SRS)** document, visual UML diagrams (**ERD, Class, and Sequence**), and the **SQL DDL schema** commands. 

Click the tabs on the right side of the screen to explore and inspect them!`,
        timestamp: new Date(),
      };

      const srsRaw = project.artifacts.find(a => a.artifact_type === 'srs')?.content;
      let srs: SRS | null = null;
      if (srsRaw) {
        try {
          srs = JSON.parse(srsRaw);
        } catch (e) {
          console.error("Failed to parse SRS JSON", e);
        }
      }

      const artifactsObj: GeneratedArtifacts = {
        srs: srs || { project_title: '', purpose: '', scope: '', user_classes: [], functional_requirements: [], non_functional_requirements: [], constraints: [] },
        erd_mermaid: project.artifacts.find(a => a.artifact_type === 'erd_mermaid')?.content || '',
        class_diagram_mermaid: project.artifacts.find(a => a.artifact_type === 'class_diagram_mermaid')?.content || '',
        sequence_diagram_mermaid: project.artifacts.find(a => a.artifact_type === 'sequence_diagram_mermaid')?.content || '',
        sql_schema: project.artifacts.find(a => a.artifact_type === 'sql_schema')?.content || '',
      };

      useToastStore.getState().showToast("Generation complete", "success");
      const isMobileOrTablet = window.innerWidth < 1024;
      set({
        isLoading: false,
        isGenerating: false,
        activeProject: project,
        activeProjectId: project.id,
        artifacts: artifactsObj,
        projects: updatedProjects,
        messages: [...get().messages, assistantMessage],
        artifactOpen: true, // Show artifact panel on completion
        rightSidebarOpen: isMobileOrTablet, // Auto-open on mobile/tablet
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Generation failed:', error);
      useToastStore.getState().showToast("Generation failed", "error");
      
      const errorMessage: Message = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error during generation:
        
> **${error.response?.data?.detail || error.message || 'Unknown backend error'}**

Please check your backend connection, ensure your Google Gemini API key is configured correctly in \`backend/.env\`, and try again.`,
        timestamp: new Date(),
      };

      set((state) => ({
        isLoading: false,
        isGenerating: false,
        messages: [...state.messages, errorMessage],
      }));
    }
  },

  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  setArtifactOpen: (open: boolean) => set({ artifactOpen: open }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  },
}));
