import { useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { SearchSection } from "./components/SearchSection";
import { NoticesSection } from "./components/NoticesSection";
import { Footer } from "./components/Footer";
import { BrowseNotices } from "./components/BrowseNotices";
import { PlaceNotice } from "./components/PlaceNotice";
import { Services } from "./components/Services";
import { About } from "./components/About";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("home");

  const renderPage = () => {
    switch (currentPage) {
      case "browse":
        return <BrowseNotices />;
      case "place":
        return <PlaceNotice />;
      case "services":
        return <Services />;
      case "about":
        return <About />;
      default:
        return (
          <>
            <Hero />
            <SearchSection />
            <NoticesSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onNavigate={setCurrentPage} currentPage={currentPage} />
      {renderPage()}
      <Footer onNavigate={setCurrentPage} />
    </div>
  );
}