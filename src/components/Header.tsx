import { Bell, Phone, User } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  return (
    <header className="bg-[#0f172a] text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => onNavigate("home")}
          >
            <Bell className="h-8 w-8" />
            <div>
              <h1 className="text-xl">Funeral Notices</h1>
              <p className="text-xs text-slate-300">Honoring memories, celebrating lives</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => onNavigate("browse")} 
              className={`hover:text-slate-300 transition-colors ${currentPage === "browse" ? "text-slate-300" : ""}`}
            >
              Browse Notices
            </button>
            <button 
              onClick={() => onNavigate("place")} 
              className={`hover:text-slate-300 transition-colors ${currentPage === "place" ? "text-slate-300" : ""}`}
            >
              Place a Notice
            </button>
            <button 
              onClick={() => onNavigate("services")} 
              className={`hover:text-slate-300 transition-colors ${currentPage === "services" ? "text-slate-300" : ""}`}
            >
              Services
            </button>
            <button 
              onClick={() => onNavigate("about")} 
              className={`hover:text-slate-300 transition-colors ${currentPage === "about" ? "text-slate-300" : ""}`}
            >
              About
            </button>
          </nav>

          <div className="flex items-center gap-3">
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
  );
}