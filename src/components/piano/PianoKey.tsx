
"use client";

import type { PianoKeyConfig } from '@/config/pianoNotes';
import { cn } from '@/lib/utils';

interface PianoKeyProps {
  config: PianoKeyConfig;
  isPressed: boolean;
  onInteractionStart: (note: string) => void;
  onInteractionEnd: (note: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const PianoKey: React.FC<PianoKeyProps> = ({
  config,
  isPressed,
  onInteractionStart,
  onInteractionEnd,
  className,
  style,
}) => {
  const { note, type, label, ariaLabel } = config;

  const handleMouseDown = () => onInteractionStart(note);
  const handleMouseUp = () => onInteractionEnd(note);
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevents mouse events from firing on touch devices
    onInteractionStart(note);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    onInteractionEnd(note);
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
      tabIndex={0} // Make it focusable, though keyboard interaction is global
      aria-pressed={isPressed}
      aria-label={ariaLabel}
      className={type === 'white' ? whiteKeyClasses : blackKeyClasses}
      style={style}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stop note if mouse leaves while pressed
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      // onKeyDown and onKeyUp are handled globally by VirtualPiano for keyboard input
    >
      <span className="text-xs font-medium pointer-events-none">{label}</span>
    </div>
  );
};

export default PianoKey;