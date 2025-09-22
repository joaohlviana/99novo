"use client";

import * as React from "react";
import { cn } from "./utils";

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

const PopoverContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

function Popover({ children, open = false, onOpenChange }: PopoverProps) {
  const [isOpen, setIsOpen] = React.useState(open);
  
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [onOpenChange]);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  return (
    <PopoverContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

function PopoverTrigger({ children, className, onClick, asChild, ...props }: PopoverTriggerProps) {
  const context = React.useContext(PopoverContext);
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context?.onOpenChange(!context.open);
    onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        handleClick(e);
        children.props.onClick?.(e);
      },
      className: cn(children.props.className, className),
      ...props
    });
  }

  return (
    <button
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

function PopoverContent({
  children,
  className,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverContentProps) {
  const context = React.useContext(PopoverContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        context?.onOpenChange(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        context?.onOpenChange(false);
      }
    };

    if (context?.open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [context]);

  if (!context?.open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        side === "bottom" && "top-full",
        side === "top" && "bottom-full",
        side === "right" && "left-full",
        side === "left" && "right-full",
        align === "start" && "left-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "end" && "right-0",
        className,
      )}
      style={{
        marginTop: side === "bottom" ? sideOffset : side === "top" ? -sideOffset : 0,
        marginLeft: side === "right" ? sideOffset : side === "left" ? -sideOffset : 0,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function PopoverAnchor({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
