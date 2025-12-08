import React, { useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { BrowseNotices } from "./components/BrowseNotices";
import { PlaceNotice } from "./components/PlaceNotice";
import { Services } from "./components/Services";
import { About } from "./components/About";
import { Advertisements } from "./components/Advertisements";
import { Contact } from "./components/Contact";
import { NoticeDetail } from "./components/NoticeDetail";
import AuthenticationPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import Onboard from "./components/Onboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import PaymentResult from "./components/PaymentResult";
import ManageAds from "./components/ManageAds";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("home");

  return (
    <div className="min-h-screen bg-slate-50">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="/place" element={<PlaceNotice />} />
          <Route path="/browse" element={<BrowseNotices />} />
          <Route path="/notice/:id" element={<NoticeDetail />} />
          <Route path="/services" element={<Services />} />
          {/* <Route path="/advertise" element={<Advertisements />} /> */}
          <Route path="/manage_ads" element={<ManageAds />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<AuthenticationPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/onboard" element={<Onboard />} />
          <Route path="/transaction_return" element={<PaymentResult />} />
        </Routes>
        <Footer />
        <Toaster />
      </BrowserRouter>
    </div>
  );
}