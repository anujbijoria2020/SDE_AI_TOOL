import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import ChatInput from '../components/chat/ChatInput';
import ChatMessage from '../components/chat/ChatMessage';
import EmptyState from '../components/chat/EmptyState';
import Spinner from '../components/ui/Spinner';
import Skeleton from '../components/ui/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { getProject } from '../api/projects';
import type { ProjectOut } from '../types';
import { AlertCircle } from 'lucide-react';

const ChatPage: React.FC = () => {
  const { projectId } = useParams();
  const id = projectId ? parseInt(projectId, 10) : NaN;
  const navigate = useNavigate();

  const {
    activeProject,
    setActiveProject,
    messages,
    isGenerating,
    generateProject,
    startNewChat,
    toggleRightSidebar,
    setIsLoading,
  } = useChatStore();

  const [inputDraft, setInputDraft] = useState('');
  const [showToast, setShowToast] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch the project from backend if ID is in parameters
  const { data: project, isLoading: isQueryLoading, error: queryError } = useQuery<ProjectOut>({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
    enabled: !isNaN(id),
    retry: false,
  });

  // Sync details loading state with chatStore
  useEffect(() => {
    setIsLoading(isQueryLoading);
  }, [isQueryLoading, setIsLoading]);

  // Scroll to bottom on new messages or loading states
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Set active project once fetched successfully via React Query
  useEffect(() => {
    if (project) {
      setActiveProject(project);
    }
  }, [project, setActiveProject]);

  // If no projectId, ensure store is cleared to start a new chat session
  useEffect(() => {
    if (!projectId) {
      startNewChat();
      setInputDraft('');
      setShowToast(false);
    }
  }, [projectId, startNewChat]);

  // Redirect if invalid numeric ID in route
  useEffect(() => {
    if (projectId && isNaN(id)) {
      navigate('/', { replace: true });
    }
  }, [projectId, id, navigate]);

  const handleSubmit = (text: string) => {
    setInputDraft('');
    generateProject(text, () => {
      // Callback triggers on successful generation
      const newProjectId = useChatStore.getState().activeProjectId;
      if (newProjectId) {
        navigate(`/chat/${newProjectId}`);
      }
      // Check if viewport is mobile/tablet, then show toast
      if (window.innerWidth < 1024) {
        setShowToast(true);
      }
    });
  };

  const handleSelectPrompt = (prompt: string) => {
    setInputDraft(prompt);
  };

  if (isQueryLoading) {
    return (
      <div className="flex-1 flex flex-col gap-6 p-8 max-w-2xl mx-auto w-full select-none justify-center">
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" className="w-8 h-8 shrink-0 bg-gray-200/85" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton variant="text" className="w-1/4 h-4 bg-gray-200/85" />
            <Skeleton variant="text" className="w-1/2 h-3 bg-gray-200/85" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <div className="flex-1 max-w-md flex flex-col gap-2 items-end">
            <Skeleton variant="rect" className="w-full h-20 rounded-2xl bg-gray-200/85" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <Skeleton variant="circle" className="w-8 h-8 shrink-0 bg-gray-200/85" />
          <div className="flex-1 flex flex-col gap-2.5">
            <Skeleton variant="text" className="w-3/4 h-3 bg-gray-200/85" />
            <Skeleton variant="rect" className="w-full h-32 rounded-2xl bg-gray-200/85" />
          </div>
        </div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none bg-white">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100 shadow-2xs">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">Project Not Found</h3>
        <p className="text-xs text-text-muted max-w-[280px] leading-relaxed mb-4">
          The project you are looking for does not exist, has been deleted, or you don't have access.
        </p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white select-text relative">
      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col min-h-0">
        <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto">
          {messages.length === 0 ? (
            <EmptyState onSelectPrompt={handleSelectPrompt} />
          ) : (
            <div className="flex flex-col w-full py-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* Simulated typing status while generation is in flight */}
              {isGenerating && (
                <div className="flex w-full gap-4 py-6 select-none justify-start px-4">
                  <div className="max-w-[85%] sm:max-w-xl bg-bg-sidebar/20 border border-border-main/60 rounded-2xl p-5 flex flex-col gap-3 text-left w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-xs">
                        <Spinner className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-text-primary">
                          Architect Assistant
                        </h4>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Thinking...
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted italic leading-relaxed pl-11">
                      Gemini is analyzing your prompt and building the Software Requirements (SRS), relational Entity-Relationship diagrams, UML classes, and SQL schemas...
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Toast Alert */}
      {showToast && (
        <div className="fixed bottom-24 left-4 right-4 z-50 bg-text-primary text-white py-3 px-4 rounded-xl shadow-2xl flex items-center justify-between animate-fade-in sm:hidden border border-border-main/20">
          <span className="text-xs font-semibold">Artifacts ready!</span>
          <button
            onClick={() => {
              toggleRightSidebar();
              setShowToast(false);
            }}
            className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
          >
            View
          </button>
        </div>
      )}

      {/* Input Tray */}
      <ChatInput onSubmit={handleSubmit} isLoading={isGenerating} initialValue={inputDraft} />
    </div>
  );
};

export default ChatPage;
