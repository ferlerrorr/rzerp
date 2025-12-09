"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-all duration-200 text-gray-500 relative"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        {/* Badge for unread count - can be dynamic */}
        <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <div className="p-4 text-center text-sm text-gray-500">
              No new notifications
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

