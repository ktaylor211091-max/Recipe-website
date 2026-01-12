"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components";

type AccountMenuProps = {
  isAdmin?: boolean;
};

export function AccountMenu({ isAdmin = false }: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="outline" 
        size="md"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        Account
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 z-[9999]">
          <Link
            href="/account"
            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
            onClick={() => setIsOpen(false)}
          >
            Profile Settings
          </Link>
          <div className="border-t border-neutral-100 my-1"></div>
          
          <Link
            href="/messages"
            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
            onClick={() => setIsOpen(false)}
          >
            Messages
          </Link>
          <Link
            href="/activity"
            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
            onClick={() => setIsOpen(false)}
          >
            Activity
          </Link>
          <Link
            href="/notifications"
            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
            onClick={() => setIsOpen(false)}
          >
            Notifications
          </Link>
          <Link
            href="/collections"
            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
            onClick={() => setIsOpen(false)}
          >
            Collections
          </Link>

          {isAdmin && (
            <>
              <div className="border-t border-neutral-100 my-1"></div>
              <Link
                href="/admin/dashboard"
                className="block px-4 py-2 text-sm text-amber-700 hover:bg-amber-50"
                onClick={() => setIsOpen(false)}
              >
                Admin Dashboard
              </Link>
              <Link
                href="/admin/analytics"
                className="block px-4 py-2 text-sm text-amber-700 hover:bg-amber-50"
                onClick={() => setIsOpen(false)}
              >
                Analytics
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
