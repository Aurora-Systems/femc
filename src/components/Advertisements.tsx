import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ExternalLink, TrendingUp } from "lucide-react";

export function Advertisements() {
  // Mock advertisement data - would come from backend in production
  const sampleAds = [
    {
      id: 1,
      company: "Doves Funeral Services",
      description: "Compassionate funeral services with dignity and respect",
      image: "funeral-service",
      website: "www.doves.co.za"
    },
    {
      id: 2,
      company: "Ecosure",
      description: "Affordable funeral cover for your family's peace of mind",
      image: "business-meeting",
      website: "www.ecosure.co.za"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl text-[#0f172a] mb-2">Advertise With Us</h1>
          <p className="text-slate-600">
            Reach thousands of families during their time of need with respectful, targeted advertising
          </p>
        </div>

        {/* Advertising Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white shadow-lg">
            <div className="text-3xl text-[#0f172a] mb-2">5,000+</div>
            <p className="text-slate-600">Monthly Visitors</p>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="text-3xl text-[#0f172a] mb-2">High Intent</div>
            <p className="text-slate-600">Targeted Audience</p>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="text-3xl text-[#0f172a] mb-2">24/7</div>
            <p className="text-slate-600">Continuous Exposure</p>
          </Card>
        </div>

        {/* Sample Advertisements */}
        <div className="mb-8">
          <h2 className="text-2xl text-[#0f172a] mb-4">Current Advertisers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleAds.map((ad) => (
              <Card key={ad.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-48 bg-slate-200 overflow-hidden">
                  <ImageWithFallback 
                    src={`https://source.unsplash.com/800x600/?${ad.image}`}
                    alt={ad.company}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl text-[#0f172a] mb-2">{ad.company}</h3>
                  <p className="text-slate-600 mb-4">{ad.description}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <ExternalLink className="h-4 w-4" />
                    <span>{ad.website}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Advertising Packages */}
        <div className="mb-8">
          <h2 className="text-2xl text-[#0f172a] mb-4">Advertising Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 shadow-lg border-2 border-slate-200 hover:border-[#0f172a] transition-all">
              <h3 className="text-xl text-[#0f172a] mb-2">Sidebar Banner</h3>
              <div className="text-3xl text-[#0f172a] mb-4">$199<span className="text-lg">/month</span></div>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>300x250px banner ad</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Displays on all pages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>~150,000 impressions/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Click tracking & analytics</span>
                </li>
              </ul>
              <Button className="w-full bg-[#0f172a] hover:bg-[#1e3a5f]">
                Get Started
              </Button>
            </Card>

            <Card className="p-6 shadow-lg border-2 border-[#0f172a] bg-slate-50">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl text-[#0f172a]">Featured Listing</h3>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-3xl text-[#0f172a] mb-4">$399<span className="text-lg">/month</span></div>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Premium 728x90px header banner</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Featured on homepage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>~400,000 impressions/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Priority placement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Detailed analytics dashboard</span>
                </li>
              </ul>
              <Button className="w-full bg-[#0f172a] hover:bg-[#1e3a5f]">
                Get Started
              </Button>
            </Card>

            <Card className="p-6 shadow-lg border-2 border-slate-200 hover:border-[#0f172a] transition-all">
              <h3 className="text-xl text-[#0f172a] mb-2">Sponsored Content</h3>
              <div className="text-3xl text-[#0f172a] mb-4">$599<span className="text-lg">/month</span></div>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Full-width content blocks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Custom article/advertorial</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Maximum visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Social media promotion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>SEO benefits</span>
                </li>
              </ul>
              <Button className="w-full bg-[#0f172a] hover:bg-[#1e3a5f]">
                Get Started
              </Button>
            </Card>
          </div>
        </div>

        {/* Contact for Advertising */}
        <Card className="shadow-lg border-2 border-[#0f172a] bg-slate-50 p-8 text-center">
          <h2 className="text-2xl text-[#0f172a] mb-4">Ready to Advertise?</h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Reach families during their time of need with respectful, professional advertising. 
            Contact our advertising team to discuss custom packages tailored to your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-[#0f172a] hover:bg-[#1e3a5f] px-8">
              Contact Advertising Team
            </Button>
            <Button variant="outline">
              Download Media Kit
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
