import React from "react";
import { BookOpen, Users, Flower2, FileText, Heart, Phone, Building2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { contactDetails } from "../constants/contactDetails";

const services = [
  {
    icon: FileText,
    title: "Funeral Notices",
    description: "Publish obituaries and funeral notices online to inform friends, family, and community members about funeral arrangements and service details.",
    features: ["Online publication", "Custom layouts", "Photo galleries", "Tribute wall"]
  },
  {
    icon: Heart,
    title: "Memorial Pages",
    description: "Create lasting tribute pages where loved ones can share memories, photos, and messages of condolence in a dedicated online space.",
    features: ["Permanent memorial", "Photo & video sharing", "Guest book", "Anniversary reminders"]
  },
  {
    icon: Building2,
    title: "Tombstone Unveiling Notices",
    description: "Announce tombstone unveiling ceremonies to invite family, friends, and community members to commemorate and honor your loved one's memory.",
    features: ["Ceremony announcements", "Event details", "RSVP management", "Location information"]
  },
  // {
  //   icon: Flower2,
  //   title: "Floral Tributes",
  //   description: "Order beautiful floral arrangements to be delivered directly to the funeral service or family home through our trusted partners.",
  //   features: ["Wide selection", "Same-day delivery", "Custom messages", "Quality guaranteed"]
  // },
  // {
  //   icon: BookOpen,
  //   title: "Order of Service",
  //   description: "Design and print professional order of service booklets for funeral ceremonies with our easy-to-use templates and design service.",
  //   features: ["Custom designs", "Quick turnaround", "Various sizes", "High-quality printing"]
  // },
  {
    icon: Users,
    title: "Funeral Directors",
    description: "Connect with trusted funeral directors in your area who can guide you through arrangements and provide professional support.",
    features: ["Verified professionals", "Local directory", "Reviews & ratings", "Free consultations"]
  },
  // {
  //   icon: Heart,
  //   title: "Grief Support",
  //   description: "Access resources and support services to help you navigate the grieving process, including counseling and support groups.",
  //   features: ["Professional counseling", "Support groups", "Resource library", "24/7 helpline"]
  // }
];

export function Services() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl text-[#0f172a] mb-4">Our Services</h1>
          <p className="text-lg text-slate-600">
            We provide comprehensive services to help you honor and remember your loved ones with dignity and respect
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow border-2 border-slate-200 hover:border-[#0f172a]">
                <div className="p-6">
                  <div className="bg-[#0f172a] text-white rounded-full p-4 w-fit mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl text-[#0f172a] mb-3">{service.title}</h3>
                  <p className="text-slate-600 mb-4">{service.description}</p>
                  <ul className="space-y-2 mb-4">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#0f172a]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {/* <Button variant="outline" className="w-full border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white">
                    Learn More
                  </Button> */}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] text-white rounded-lg shadow-xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <Phone className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl mb-4">Need Help Choosing a Service?</h2>
            <p className="text-slate-200 mb-6">
              Our compassionate team is available 24/7 to guide you through our services and help you make the right choices for honoring your loved one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-white text-[#0f172a] hover:bg-slate-100"
                onClick={() => navigate("/contact")}
              >
                <Phone className="h-4 w-4 mr-2" />
                Contact Us
              </Button>
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
