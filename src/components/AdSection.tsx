import React from "react";
import { ExternalLink } from "lucide-react";
import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface AdSectionProps {
  variant?: "sidebar" | "inline";
}

export function AdSection({ variant = "sidebar" }: AdSectionProps) {
  // Mock ad data - would come from ad management system in production
  const ads = [
    {
      id: 1,
      company: "Doves Funeral Services",
      tagline: "Compassionate care when you need it most",
      image: "funeral-service",
      link: "#"
    },
    {
      id: 2,
      company: "Ecosure",
      tagline: "Protecting your family's future",
      image: "family-insurance",
      link: "#"
    }
  ];

  if (variant === "sidebar") {
    return (
      <div className="space-y-4">
        <p className="text-xs text-slate-500 uppercase tracking-wide">Sponsored</p>
        {ads.map((ad) => (
          <Card key={ad.id} className="overflow-hidden hover:shadow-lg transition-shadow border-slate-200">
            <a href={ad.link} className="block">
              <div className="h-32 bg-slate-100 overflow-hidden">
                <ImageWithFallback 
                  src={`https://source.unsplash.com/400x300/?${ad.image}`}
                  alt={ad.company}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h4 className="text-sm text-[#0f172a] mb-1">{ad.company}</h4>
                <p className="text-xs text-slate-600 mb-2">{ad.tagline}</p>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <span>Learn more</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </a>
          </Card>
        ))}
      </div>
    );
  }

  // Inline variant - horizontal ad between content
  return (
    <div className="my-8">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-3 text-center">Sponsored</p>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <a href={ads[0].link} className="block">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="w-full md:w-48 h-32 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
              <ImageWithFallback 
                src={`https://source.unsplash.com/400x300/?${ads[0].image}`}
                alt={ads[0].company}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg text-[#0f172a] mb-2">{ads[0].company}</h3>
              <p className="text-slate-600 mb-3">{ads[0].tagline}</p>
              <div className="flex items-center gap-2 text-sm text-blue-600 justify-center md:justify-start">
                <span>Learn more about our services</span>
                <ExternalLink className="h-4 w-4" />
              </div>
            </div>
          </div>
        </a>
      </Card>
    </div>
  );
}
