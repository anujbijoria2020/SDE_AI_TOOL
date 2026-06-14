import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'bottom';
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  children,
  side = 'left',
}) => {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [translateY, setTranslateY] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (side !== 'bottom') return;
    setTouchStartY(e.touches[0].clientY);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (side !== 'bottom' || touchStartY === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY;
    // Only allow pulling down
    if (diff > 0) {
      setTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (side !== 'bottom' || touchStartY === null) return;
    setIsSwiping(false);
    // If swiped down past threshold (100px), trigger close
    if (translateY > 100) {
      onClose();
    }
    setTranslateY(0);
    setTouchStartY(null);
  };

  const slideStyles = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
    bottom: isOpen ? 'translate-y-0' : 'translate-y-full',
  };

  const sideAlignment = {
    left: 'left-0 rounded-r-2xl top-0 bottom-0 w-[85%] max-w-[320px] sm:max-w-[380px] h-full',
    right: 'right-0 rounded-l-2xl top-0 bottom-0 w-[85%] max-w-[320px] sm:max-w-[380px] h-full',
    bottom: 'bottom-0 left-0 right-0 rounded-t-2xl h-[80vh] w-full',
  };

  return (
    <div className="fixed inset-0 z-40 flex lg:hidden">
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer content wrapper */}
      <div 
        className={`fixed z-50 bg-white border-border-main flex flex-col shadow-2xl transition-transform duration-350 ease-out transform ${slideStyles[side]} ${sideAlignment[side]}`}
        style={
          side === 'bottom'
            ? {
                transform: `translateY(${isOpen ? translateY : 100}px)`,
                transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
              }
            : undefined
        }
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle for Bottom Sheet */}
        {side === 'bottom' && (
          <div className="w-full flex justify-center py-3 select-none shrink-0 cursor-grab active:cursor-grabbing border-b border-gray-50">
            <div className="w-12 h-1.5 rounded-full bg-gray-200" />
          </div>
        )}

        {/* Close Button overlay */}
        <div className={`absolute top-4 ${side === 'bottom' ? 'right-4' : (side === 'left' ? 'right-4' : 'left-4')} z-50`}>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-hover-bg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Child components */}
        <div className="flex-1 overflow-y-auto h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;
