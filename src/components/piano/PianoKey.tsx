
"use client";

import type { PianoKeyConfig } from '@/config/pianoNotes';
import { cn } from '@/lib/utils';

interface PianoKeyProps {
  config: PianoKeyConfig;
  isPressed: boolean;
  onInteractionStart: (note: string) => void;
  onInteractionEnd: (note: string) => void;
  isGlobalMouseDown: boolean; // New prop
  className?: string;
  style?: React.CSSProperties;
}

const PianoKey: React.FC<PianoKeyProps> = ({
  config,
  isPressed,
  onInteractionStart,
  onInteractionEnd,
  isGlobalMouseDown,
  className,
  style,
}) => {
  const { note, type, label, ariaLabel } = config;

  const handleMouseDownLocal = () => {
    onInteractionStart(note);
  };

  const handleMouseUpLocal = () => {
    // Only stop if this key is actually pressed.
    // This prevents issues if mouseup happens over a key that wasn't the source of the mousedown,
    // or if interaction ended due to mouse leave during drag.
    if (isPressed) {
        onInteractionEnd(note);
    }
  };

  const handleMouseEnterLocal = () => {
    if (isGlobalMouseDown && !isPressed) {
      onInteractionStart(note);
    }
  };

  const handleMouseLeaveLocal = () => {
    // If dragging (global mouse down) and this key is pressed, stop it.
    if (isGlobalMouseDown && isPressed) {
      onInteractionEnd(note);
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); 
    onInteractionStart(note);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    // Ensure it was pressed before trying to stop, for robustness
    if (isPressed) {
        onInteractionEnd(note);
    }
  };

  const keyBaseClasses = "relative flex items-end justify-center p-2 border cursor-pointer select-none transition-all duration-50 ease-out shadow-md active:shadow-inner";
  
  const whiteKeyClasses = cn(
    keyBaseClasses,
    "bg-white text-neutral-700 border-neutral-300 rounded-b-md flex-shrink-0",
    "hover:bg-neutral-100",
    isPressed && "bg-gradient-to-b from-neutral-100 to-neutral-300 scale-[0.98] shadow-inner",
    className
  );

  const blackKeyClasses = cn(
    keyBaseClasses,
    "bg-neutral-800 text-neutral-200 border-neutral-900 rounded-b-sm z-10",
    "hover:bg-neutral-700",
    isPressed && "bg-gradient-to-b from-neutral-700 to-neutral-900 scale-[0.97] shadow-inner",
    className
  );

  return (
    <div
      role="button"
      tabIndex={0} 
      aria-pressed={isPressed}
      aria-label={ariaLabel}
      className={type === 'white' ? whiteKeyClasses : blackKeyClasses}
      style={style}
      onMouseDown={handleMouseDownLocal}
      onMouseUp={handleMouseUpLocal}
      onMouseEnter={handleMouseEnterLocal}
      onMouseLeave={handleMouseLeaveLocal} 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <span className="text-xs font-medium pointer-events-none">{label}</span>
    </div>
  );
};

export default PianoKey;
