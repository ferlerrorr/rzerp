"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MailDropdown } from "./mail-dropdown";
import { NotificationDropdown } from "./notification-dropdown";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import { Link as RouterLink } from "@tanstack/react-router";

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const {
    searchOpen,
    searchQuery,
    profileDropdownOpen,
    setSearchOpen,
    setSearchQuery,
    setProfileDropdownOpen,
  } = useUIStore();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown and search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close profile dropdown if clicking outside
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }

      // Close search if clicking outside search container
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        searchOpen
      ) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchOpen, setProfileDropdownOpen, setSearchOpen, setSearchQuery]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Auto-close search when input becomes empty
  useEffect(() => {
    if (searchOpen && searchQuery.trim() === "") {
      const timer = setTimeout(() => {
        setSearchOpen(false);
        setSearchQuery("");
      }, 1500); // Close after 1.5 seconds of empty input

      return () => clearTimeout(timer);
    }
  }, [searchQuery, searchOpen, setSearchOpen, setSearchQuery]);

  // Handle search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // TODO: Implement actual search logic here
    }
  };

  // Handle search button click
  const handleSearchClick = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      // If opening search, focus the input after animation
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 300);
    }
  };

  // Handle escape key to close search
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [searchOpen, setSearchOpen, setSearchQuery]);

  // Generate initials from user name
  const getUserInitials = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    } else {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
  };

  // Generate avatar background color based on user name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Get role display information
  const getRoleInfo = (user: any) => {
    const role = user.roles?.[0] || "User";
    const roleAbbreviation = role
      .split(" ")
      .map((word: string) => word.charAt(0))
      .join("")
      .toUpperCase();
    const roleDisplay = role === "User" ? "Standard User" : role;
    const roleHandle = `@${user.name.toLowerCase().replace(/\s+/g, "")}`;

    return {
      abbreviation: roleAbbreviation,
      display: roleDisplay,
      handle: roleHandle,
    };
  };

  return (
    <header className="flex rounded-2xl sm:rounded-3xl mx-2 sm:mx-4 px-2 sm:px-3 h-16 sm:h-20 md:h-24 shrink-0 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] items-center transition-all duration-300 ease-in-out bg-white text-gray-900 shadow-sm border border-gray-100 -mt-4 sm:-mt-6">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 px-2 sm:px-4 md:px-6 w-full mt-4 sm:mt-6">
        {/* Sidebar Toggle Button */}
        <SidebarTrigger className="-ml-1" />

        {/* Title or Branding */}
        <h1 className="text-sm sm:text-base md:text-lg font-semibold tracking-tight flex-shrink-0 min-w-0">
          <span className="hidden sm:inline">
            {isAuthenticated && user
              ? `Hello, ${user.name}!`
              : "Hello, Good Day!"}
          </span>
          <span className="sm:hidden">
            {isAuthenticated && user ? "Hi!" : "Hello!"}
          </span>
        </h1>

        {/* Right side icons */}
        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-5 ml-auto flex-shrink-0">
          {/* Search Container */}
          <div className="relative flex items-center" ref={searchContainerRef}>
            {/* Animated Search Input */}
            <div
              className={`absolute right-0 top-0 transition-all duration-300 ease-in-out ${
                searchOpen
                  ? "w-40 sm:w-48 md:w-56 lg:w-64 opacity-100"
                  : "w-0 opacity-0 pointer-events-none"
              }`}
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 pr-8 sm:pr-10 bg-gray-50 border border-gray-50 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="submit"
                  className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 p-0.5 sm:p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                </button>
              </form>
            </div>
            {/* Search Icon Button */}
            <button
              onClick={handleSearchClick}
              className={`p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-all duration-200 ${
                searchOpen ? "bg-blue-50 text-blue-600" : "text-gray-500"
              }`}
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Mail Dropdown */}
          <MailDropdown />

          {/* Notification Dropdown */}
          <NotificationDropdown />

          {/* Profile Picture with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="p-0.5 sm:p-1 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              {isAuthenticated && user ? (
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 ${getAvatarColor(
                    user.name
                  )} rounded-full flex items-center justify-center`}
                >
                  <span className="text-white text-xs sm:text-sm font-semibold">
                    {getUserInitials(user.name)}
                  </span>
                </div>
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
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
                </div>
              )}
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && isAuthenticated && user && (
              <div className="absolute right-0 mt-2 sm:mt-3 w-[calc(100vw-2rem)] sm:w-64 max-w-xs sm:max-w-none bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                {/* Account Header */}
                <div className="p-3 sm:p-4 bg-gray-50/50">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 ${getAvatarColor(
                        user.name
                      )} rounded-full flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-white text-xs sm:text-sm font-bold">
                        {getUserInitials(user.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Account
                    </span>
                    <div
                      className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-semibold text-white ${getAvatarColor(
                        user.name
                      )}`}
                    >
                      {getRoleInfo(user).abbreviation}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      {getRoleInfo(user).display}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getRoleInfo(user).handle}
                    </p>
                  </div>
                </div>

                {/* Menu Actions */}
                <div className="py-1 sm:py-2 bg-white">
                  <RouterLink
                    to="/settings"
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2 sm:space-x-3"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0"
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
                    <span>Profile Settings</span>
                  </RouterLink>
                  <RouterLink
                    to="/settings"
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2 sm:space-x-3"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Account Settings</span>
                  </RouterLink>
                  <button
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2 sm:space-x-3"
                    onClick={async () => {
                      await logout();
                      setProfileDropdownOpen(false);
                      window.location.href = "/auth/login";
                    }}
                  >
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
