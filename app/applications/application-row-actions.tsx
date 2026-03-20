"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { deleteApplication } from "@/lib/actions/applications";

export function ApplicationRowActions({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updatePosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4,
      right: typeof window !== "undefined" ? window.innerWidth - rect.right : rect.width,
    });
  }, []);

  useEffect(() => {
    if (open && buttonRef.current) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      const menu = document.querySelector("[data-application-row-menu]");
      if (menu?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePosition]);

  function handleDelete() {
    if (!confirm("Delete this application? This cannot be undone.")) return;
    setOpen(false);
    const formData = new FormData();
    formData.set("id", id);
    deleteApplication(formData);
  }

  const menuContent =
    open && typeof document !== "undefined" ? (
      <div
        data-application-row-menu
        className="fixed z-[100] min-w-[140px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        style={{
          top: position.top,
          right: position.right,
          left: "auto",
        }}
      >
        <Link
          href={`/applications/${id}`}
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          Edit
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleDelete();
          }}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-900/20"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Delete
        </button>
      </div>
    ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const btn = e.currentTarget;
          const rect = btn.getBoundingClientRect();
          setPosition({
            top: rect.bottom + 4,
            right: window.innerWidth - rect.right,
          });
          setOpen((o) => !o);
        }}
        className="rounded p-1 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
        aria-label="More actions"
        aria-expanded={open}
      >
        <MoreVertical className="h-5 w-5" aria-hidden />
      </button>
      {menuContent && createPortal(menuContent, document.body)}
    </>
  );
}
