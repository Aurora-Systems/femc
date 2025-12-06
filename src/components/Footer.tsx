import React from "react";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { contactDetails } from "../constants/contactDetails";
import { ImageWithFallback } from "./figma/ImageWithFallback";



export function Footer() {
  const navigate = useNavigate();
 
  return (
    <footer className="bg-[#0f172a] text-white ">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ImageWithFallback
                src="https://funeralnotices.sirv.com/femc_main_logo.png"
                alt="Funeral Notices Logo"
                className="h-6 w-auto"
              />
              <h3 className="text-lg">Funeral Notices</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Honoring memories and celebrating the lives of loved ones with dignity and respect.
            </p>
            {/* <div className="flex gap-3">
              <a href="#" className="hover:text-slate-300 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-slate-300 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-slate-300 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div> */}
          </div>
          
          <div>
            <h4 className="mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button onClick={() => navigate("about")} className="hover:text-white transition-colors">
                  About
                </button>
              </li>
              <li>
                <button onClick={() => navigate("place")} className="hover:text-white transition-colors">
                  Place a Notice
                </button>
              </li>
              <li>
                <button onClick={() => navigate("browse")} className="hover:text-white transition-colors">
                  Browse Notices
                </button>
              </li>
              <li>
                <button onClick={() => navigate("services")} className="hover:text-white transition-colors">
                  Services
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              {/* <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li> */}
              <li>
                <button onClick={() => navigate("advertise")} className="hover:text-white transition-colors">
                  Advertise With Us
                </button>
              </li>
              {/* <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li> */}
              <li>
                <button onClick={() => navigate("/contact")} className="hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-1 flex-shrink-0" />
                <button 
                  className="hover:text-white transition-colors text-left"
                >
                  {contactDetails.phone}
                </button>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-1 flex-shrink-0" />
                <button 
                  className="hover:text-white transition-colors text-left"
                >
                  {contactDetails.email}
                </button>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <button 
                  className="hover:text-white transition-colors text-left"
                >
                  {contactDetails.address}
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2024 Funeral Notices. All rights reserved. | <a href="#" className="hover:text-white">Privacy Policy</a> | <a href="#" className="hover:text-white">Terms of Service</a></p>
        </div>
      </div>
    </footer>
  );
}