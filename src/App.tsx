import React, { useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { BrowseNotices } from "./components/BrowseNotices";
import { PlaceNotice } from "./components/PlaceNotice";
import { Services } from "./components/Services";
import { About } from "./components/About";
import { Advertisements } from "./components/Advertisements";
import AuthenticationPage from "./components/AuthPage";
import { BrowserRouter,Routes, Route } from "react-router-dom";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("home");

 

  return (
    <div className="min-h-screen bg-slate-50">
       <BrowserRouter>
      <Header />
     
        <Routes>
          <Route path="/" element={<About/>} />
          <Route path="/place" element={<PlaceNotice />} />
          <Route path="/browse" element={<BrowseNotices />} />
          <Route path="/services" element={<Services />} />
          <Route path="/advertise" element={<Advertisements />} />
          <Route path="/auth" element={<AuthenticationPage />} />
        </Routes>
      

      <Footer  />
      </BrowserRouter>
    </div>
  );
}