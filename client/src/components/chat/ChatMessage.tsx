import React from 'react';
import type { Message } from '../../types';
import ReactMarkdown from 'react-markdown';
import { useChatStore } from '../../store/chatStore';
import { useNavigate } from 'react-router-dom';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const { setArtifactOpen, rightSidebarOpen, toggleRightSidebar, messages, generateProject } = useChatStore();
  const navigate = useNavigate();

  if (isUser) {
    return (
      <div className="flex w-full py-4 justify-end select-text px-4">
        <div className="max-w-[70%] bg-accent text-white py-3 px-4 rounded-2xl rounded-tr-sm shadow-xs text-sm text-left leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  // Check if it is an error or general failure response
  const isError = message.content.includes('error') || message.content.includes('failed') || message.content.includes('Sorry');

  if (isError) {
    const userMessages = messages.filter((m) => m.role === 'user');
    const lastUserMsg = userMessages[userMessages.length - 1];
    const lastPrompt = lastUserMsg?.content;

    return (
      <div className="flex w-full py-4 justify-start select-text px-4">
        <div className="max-w-[85%] sm:max-w-xl bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs leading-normal text-left font-medium flex flex-col gap-3">
          <ReactMarkdown>{message.content}</ReactMarkdown>
          {lastPrompt && (
            <button
              onClick={() => generateProject(lastPrompt, () => {
                const newId = useChatStore.getState().activeProjectId;
                if (newId) {
                  navigate(`/chat/${newId}`);
                }
              })}
              className="w-fit px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold mt-1 cursor-pointer transition-colors shadow-2xs"
            >
              Retry Generation
            </button>
          )}
        </div>
      </div>
    );
  }

  // Assistant message (summary card style)
  return (
    <div className="flex w-full py-6 justify-start select-text px-4">
      <div className="max-w-[85%] sm:max-w-xl bg-bg-sidebar/40 border border-border-main rounded-2xl p-5 flex flex-col gap-4 text-left shadow-xs">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="font-bold text-sm">✓</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-text-primary mb-1">
              Generation Completed
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              I have successfully generated your complete software engineering package:
            </p>
            <ul className="mt-2 text-xs font-semibold text-text-primary flex flex-col gap-1.5 list-none pl-0">
              <li className="flex items-center gap-1.5">
                <span className="text-green-500">•</span> Software Requirements Specification (SRS)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-green-500">•</span> Entity-Relationship Diagram (ERD)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-green-500">•</span> Class UML Diagram
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-green-500">•</span> Sequence Flow Diagram
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-green-500">•</span> Production SQL Database Schema
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => {
            setArtifactOpen(true);
            // On mobile/tablet, make sure drawer opens
            if (!rightSidebarOpen) {
              toggleRightSidebar();
            }
          }}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-border-main hover:bg-hover-bg/40 text-text-primary text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs mt-2 animate-pulse"
        >
          <span>View artifacts</span>
          <span className="text-text-muted">→</span>
        </button>
      </div>
    </div>
  );
};

export default ChatMessage;
