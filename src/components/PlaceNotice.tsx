import { Upload, Info } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";

export function PlaceNotice() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl text-[#0f172a] mb-2">Place a Funeral Notice</h1>
          <p className="text-slate-600">Share the memory of your loved one</p>
        </div>

        <Card className="shadow-lg border-2 border-slate-200">
          <div className="p-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="mb-1">Our team will review your notice before publication.</p>
                <p>For urgent requests, please call us at 0800 123 4567</p>
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" placeholder="Enter first name" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" placeholder="Enter last name" className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="Age" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" placeholder="City or Town" className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="birthDate">Date of Birth</Label>
                  <Input id="birthDate" type="date" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="passedDate">Date of Passing *</Label>
                  <Input id="passedDate" type="date" className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="obituary">Obituary / Tribute *</Label>
                <Textarea 
                  id="obituary" 
                  placeholder="Share memories and details about your loved one..." 
                  className="mt-1 min-h-[150px]"
                />
                <p className="text-xs text-slate-500 mt-1">Maximum 500 words</p>
              </div>

              <div>
                <Label htmlFor="serviceDetails">Funeral Service Details</Label>
                <Textarea 
                  id="serviceDetails" 
                  placeholder="Include venue, date, time, and any special instructions..." 
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="photo">Upload Photo (Optional)</Label>
                <div className="mt-1 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#0f172a] transition-colors cursor-pointer">
                  <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg text-[#0f172a] mb-4">Your Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contactName">Your Name *</Label>
                    <Input id="contactName" placeholder="Your full name" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Email Address *</Label>
                    <Input id="contactEmail" type="email" placeholder="your@email.com" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input id="contactPhone" type="tel" placeholder="Phone number" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input id="relationship" placeholder="e.g. Son, Daughter" className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <Button type="submit" className="bg-[#0f172a] hover:bg-[#1e3a5f] px-8">
                  Submit Notice
                </Button>
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
              </div>
            </form>
          </div>
        </Card>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg text-[#0f172a] mb-4">Pricing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="text-[#0f172a] mb-2">Basic Notice</h4>
              <p className="text-2xl text-[#0f172a] mb-2">£150</p>
              <p className="text-sm text-slate-600">7 days online, up to 200 words</p>
            </div>
            <div className="border-2 border-[#0f172a] rounded-lg p-4 bg-slate-50">
              <h4 className="text-[#0f172a] mb-2">Standard Notice</h4>
              <p className="text-2xl text-[#0f172a] mb-2">£250</p>
              <p className="text-sm text-slate-600">30 days online, up to 500 words, photo included</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="text-[#0f172a] mb-2">Premium Notice</h4>
              <p className="text-2xl text-[#0f172a] mb-2">£400</p>
              <p className="text-sm text-slate-600">90 days online, unlimited words, photo gallery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
