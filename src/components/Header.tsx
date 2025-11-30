import React, { useState, useEffect } from "react";
import { Bell, Phone, User, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";



export function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { label: "Home", path: "" },
    { label: "Place a Notice", path: "place" },
    { label: "Browse Notices", path: "browse" },
    { label: "Services", path: "services" },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('.mobile-menu') && !target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);
  
  return (
    <>
      <header className="bg-[#0f172a] text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => navigate("")}
            >
              <Bell className="h-8 w-8" />
              <div>
                <h1 className="text-xl">Funeral Notices</h1>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <button 
                  key={item.path}
                  onClick={() => navigate(item.path)} 
                  className="hover:text-slate-300 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {/* Mobile Menu Button - Only visible on mobile (hidden on md and up) */}
              <button
                type="button"
                className="menu-button text-white hover:bg-slate-700 p-2 rounded-md transition-colors block md:hidden"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>

              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700">
                <Phone className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Contact</span>
              </Button>
              <Button variant="outline" size="sm" className="bg-white border-white text-black hover:bg-[#0f172a] hover:text-white">
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              isMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
          />
          
          {/* Side Menu */}
          <div 
            className={`mobile-menu absolute left-0 top-0 h-full w-3/4 max-w-sm bg-[#0f172a] shadow-xl transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full p-6">
              {/* Header with close button */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Menu</h2>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white hover:bg-slate-700 p-2 rounded-md transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className="text-left text-white hover:text-slate-300 transition-colors py-3 px-2 text-lg font-medium rounded-md hover:bg-slate-800 w-full"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}