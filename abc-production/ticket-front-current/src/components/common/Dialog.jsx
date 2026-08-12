import { cn } from "@nextui-org/react";
import { cva } from "class-variance-authority";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

function Dialog({ open, onClose, size, radius, className, children }) {
  // Escape closes, and the page behind stops scrolling while the dialog is up.
  // Without the lock, scrolling inside a tall dialog on a phone drags the page
  // underneath once the dialog's own scroller hits its end.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    open &&
    createPortal(
      <div className="w-full h-screen fixed inset-0 z-50">
        <div className={`overlay animate-overlayShow`} onClick={onClose}></div>
        <Content size={size} radius={radius} className={className}>
          {children}
        </Content>
      </div>,
      document.body
    )
  );
}

const Content = ({ children, size, radius, className }) => {
  const variants = cva(
    `bg-white relative mx-4 w-full z-50 animate-contentShow flex flex-col max-h-[92vh] overflow-hidden`,
    {
      variants: {
        radius: {
          none: "rounded-none",
          sm: "rounded-sm",
          md: "rounded-md",
          lg: "rounded-lg",
          xl: "rounded-xl",
        },
        size: {
          sm: "max-w-sm",
          md: "max-w-md",
          lg: "max-w-lg",
          xl: "max-w-xl",
          "2xl": "max-w-2xl",
          "3xl": "max-w-3xl",
          "4xl": "max-w-4xl",
          "5xl": "max-w-5xl",
        },
      },
      defaultVariants: {
        radius: "md",
        size: "lg",
      },
    }
  );

  return (
    <div className={`w-full h-full box-center`}>
      <div role="dialog" aria-modal="true" className={cn(variants({ size, radius }), className)}>
        {children}
      </div>
    </div>
  );
};

export const Header = ({ children, className }) => {
  return (
    <header
      className={cn(
        "py-3 px-4 text-h6 flex justify-between items-center shrink-0",
        className
      )}
    >
      {children}
    </header>
  );
};

export const Body = ({ children, className }) => {
  return <div className={cn("py-3 px-4", className)}>{children}</div>;
};

export const Footer = ({ children, className }) => {
  return (
    <footer
      className={cn(
        "py-3 px-4 border-t flex items-center justify-end gap-x-2 shrink-0",
        className
      )}
    >
      {children}
    </footer>
  );
};

export default Object.assign(Dialog, {
  Header,
  Body,
  Footer,
});
