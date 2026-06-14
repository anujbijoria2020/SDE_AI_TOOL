import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../ui/Button';
import { useChatStore } from '../../store/chatStore';
import { useNavigate } from 'react-router-dom';

const NewChatButton: React.FC = () => {
  const startNewChat = useChatStore((state) => state.startNewChat);
  const sidebarCollapsed = useChatStore((state) => state.sidebarCollapsed);
  const navigate = useNavigate();

  const handleNewChat = () => {
    startNewChat();
    navigate('/');
  };

  return (
    <Button
      variant="outline"
      className={`border-dashed border-2 hover:border-accent hover:text-accent font-medium py-2.5 transition-all ${
        sidebarCollapsed ? 'w-10 h-10 p-0 justify-center rounded-xl mx-auto flex' : 'w-full justify-start'
      }`}
      leftIcon={sidebarCollapsed ? undefined : <Plus size={16} />}
      onClick={handleNewChat}
      title="New Chat"
    >
      {sidebarCollapsed ? <Plus size={18} /> : 'New Chat'}
    </Button>
  );
};

export default NewChatButton;
