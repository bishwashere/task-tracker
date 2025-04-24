"use client";

import React, { useEffect, useRef } from "react";

export default function Modal({
  modalIsOpen,
  setModalIsOpen,
  children,
  className,
}: {
  modalIsOpen: boolean;
  setModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  className?: string;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modalIsOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModalIsOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setModalIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalIsOpen, setModalIsOpen]);

  if (!modalIsOpen) return null;
  if (modalIsOpen)
    return (
      <div
        className="fixed inset-0 overflow-y-auto h-full w-full flex items-center justify-center backdrop:blur-2xl transition-opacity duration-300 z-[999]"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(1.5px)",
        }}
      >
        <div
          ref={modalRef}
          className={`shadow-lg rounded-xl bg-white min-w-96 max-w-[90vw] opacity-100 ${className}`}
        >
          {children}
        </div>
      </div>
    );
}
