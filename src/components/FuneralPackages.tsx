import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Phone, MessageCircle, Package, Users, Clock, AlertCircle } from "lucide-react";
import { contactDetails } from "../constants/contactDetails";

export function FuneralPackages() {
  const phoneNumber = contactDetails.phone.replace(/\s/g, ""); // Remove spaces from phone number
  
  const handleWhatsApp = (packageName: string, packageType: string) => {
    const message = encodeURIComponent(
      `Good day! I'm interested in ${packageName} - ${packageType}. Can I get more information?`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const funeralPackages = [
    {
      name: "Package A",
      items: [
        "VIP Toilets",
        "Tent",
        "Chairs",
        "PA System",
        "Cutlery",
        "Tools",
        "a Bag of Cement",
        "Zinc Sheet",
        "Solar Lights",
        "Generator",
        "Decor",
        "plus lots and lots of other items"
      ],
      description: "Practically everything that is needed for a funeral event",
      price: "US$1.00",
      deposit: "50% refundable deposit required"
    },
    {
      name: "Package B",
      items: [
        "Portable Toilets",
        "Tent",
        "Chairs",
        "PA System",
        "Cutlery",
        "Tools",
        "a Bag of Cement",
        "Zinc Sheet",
        "Solar Lights",
        "Generator",
        "Decor",
        "plus lots and lots of other items"
      ],
      description: "Practically everything that is needed for a funeral event",
      price: "US$1.00",
      deposit: "50% refundable deposit required"
    }
  ];

  const memorialPackages = [
    {
      name: "Package A",
      items: [
        "VIP Toilets",
        "Tent",
        "Chairs",
        "PA System",
        "Cutlery",
        "Tools",
        "Solar Lights",
        "Generator",
        "Decor",
        "plus lots and lots of other items"
      ],
      description: "Practically everything you need for memorial & Tombstone unveiling events",
      price: "US$1.00",
      deposit: "50% refundable deposit required"
    },
    {
      name: "Package B",
      items: [
        "Portable Toilets",
        "Tent",
        "Chairs",
        "PA System",
        "Cutlery",
        "Tools",
        "Decor",
        "plus lots and lots of other items"
      ],
      description: "Practically everything you need for memorial service & Tombstone unveiling events",
      price: "US$1.00",
      deposit: "50% refundable deposit required"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl text-[#0f172a] mb-4">Funeral Event Packages</h1>
          <p className="text-lg text-slate-600">
            Comprehensive packages designed to meet all your funeral and memorial service needs
          </p>
        </div>
        <Card className="border-2 border-blue-200 bg-blue-50 mb-8 py-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-xl text-blue-900">Important Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-md">
              <p className="font-semibold text-[#0f172a] mb-2">Starlink is included on all Packages</p>
              <p className="text-sm text-slate-600">Terms and Conditions may apply</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-[#0f172a]" />
                  <h4 className="font-semibold text-[#0f172a]">Hire Period</h4>
                </div>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>• Funerals: 3 days / 72 hours</li>
                  <li>• Memorial & Tombstone Unveiling: 1 day / 24 hours</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-[#0f172a]" />
                  <h4 className="font-semibold text-[#0f172a]">Capacity</h4>
                </div>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>• Funeral packages: Maximum 500 people</li>
                  <li>• Memorial & Tombstone Unveiling: Maximum 300 people</li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-4 rounded-md">
              <h4 className="font-semibold text-[#0f172a] mb-2">Additional Details</h4>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>• Equipment maximum number of 120 line items per package</li>
                <li>• PA System available for 24 hours only on all Packages</li>
                <li>• Transportation charge applicable for areas outside a 40km radius of service areas</li>
              </ul>
            </div>
          </CardContent>
        </Card>


        {/* Funeral Event Packages Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Package className="h-8 w-8 text-[#0f172a]" />
            <h2 className="text-3xl text-[#0f172a] font-bold">Funeral Event Packages</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {funeralPackages.map((pkg, index) => (
              <Card key={index} className="border-2 border-slate-200 hover:border-[#0f172a] transition-all hover:shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#0f172a] to-[#1e3a5f] text-white rounded py-4">
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription className="text-slate-200 mt-2">
                    {pkg.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#0f172a] mb-2">Includes:</h4>
                      <ul className="space-y-1">
                        {pkg.items.map((item, idx) => (
                          <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#0f172a] mt-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-bold text-[#0f172a]">{pkg.price}</span>
                        <span className="text-sm text-slate-600">plus vat</span>
                      </div>
                      <p className="text-sm text-slate-600">{pkg.deposit}</p>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => handleWhatsApp(pkg.name, "Funeral Event Package")}
                        className="flex-1 border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button
                        onClick={handleCall}
                        variant="outline"
                        className="flex-1 border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Memorial & Tombstone Unveiling Packages Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Package className="h-8 w-8 text-[#0f172a]" />
            <h2 className="text-3xl text-[#0f172a] font-bold">Memorial & Tombstone Unveiling Packages</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {memorialPackages.map((pkg, index) => (
              <Card key={index} className="border-2 border-slate-200 hover:border-[#0f172a] transition-all hover:shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#0f172a] to-[#1e3a5f] text-white rounded py-4">
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription className="text-slate-200 mt-2">
                    {pkg.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#0f172a] mb-2">Includes:</h4>
                      <ul className="space-y-1">
                        {pkg.items.map((item, idx) => (
                          <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#0f172a] mt-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-bold text-[#0f172a]">{pkg.price}</span>
                        <span className="text-sm text-slate-600">plus vat</span>
                      </div>
                      <p className="text-sm text-slate-600">{pkg.deposit}</p>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => handleWhatsApp(pkg.name, "Memorial & Tombstone Unveiling Package")}
                        className="flex-1 border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button
                        onClick={handleCall}
                        variant="outline"
                        className="flex-1 border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Important Information Section */}
      
        {/* Contact CTA */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] text-white rounded-lg shadow-xl p-8 md:p-12 text-center">
          <h2 className="text-3xl mb-4">Have Questions About Our Packages?</h2>
          <p className="text-slate-200 mb-6 max-w-2xl mx-auto">
            Our team is here to help you choose the right package for your needs. Contact us today for more information or to make a booking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => handleWhatsApp("", "General Inquiry")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp Us
            </Button>
            <Button
              onClick={handleCall}
              className="bg-white text-[#0f172a] hover:bg-slate-100"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

