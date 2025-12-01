import React, { useState, useEffect } from "react";
import { Upload, Eye, FileImage } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { NoticePreview } from "./NoticePreview";
import { useNavigate } from "react-router-dom";
import db from "../init/db";

export function PlaceNotice() {
  const navigate = useNavigate();
  const [noticeType, setNoticeType] = useState("death");
  const [accountType, setAccountType] = useState("individual");
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    location: "",
    birthDate: "",
    passedDate: "",
    obituary: "",
    serviceDetails: "",
    photo: "",
    noticeType: "Death Notice",
  });
  const [isOnboarded, setIsOnboarded] = useState(false);
  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();

    // Get the notice type label
    const noticeTypeLabel =
      noticeType === "death"
        ? "Death Notice"
        : noticeType === "memorial"
          ? "Memorial Service"
          : "Tombstone Unveiling";

    setFormData({
      ...formData,
      noticeType: noticeTypeLabel,
    });
    setShowPreview(true);
  };

  const handleConfirmSubmit = () => {
    // Handle actual submission here
    console.log("Submitting notice:", formData);
    setShowPreview(false);
    // Show success message, redirect, etc.
  };

  const price =
    accountType === "individual" ? "$9.99" : "$19.99";
  const isIndividual = accountType === "individual";

  const check_onboarded=async()=>{
    const { data: { session } } = await db.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    const { data: profile } = await db
      .from("users")
      .select("*")
      .eq("user_id", session.user.id)
      .single();
    if (!profile) {
      navigate("/onboard");
      return;
    }
    setIsOnboarded(true);
  }

  useEffect(()=>{
    check_onboarded();
  },[])

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl text-[#0f172a] mb-2">
            Place a Funeral Notice
          </h1>
          <p className="text-slate-600">
            Share the memory of your loved one
          </p>
        </div>

        <Card className="shadow-lg border-2 border-slate-200">
          <div className="p-8">
            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="mb-1">Our team will review your notice before publication.</p>
                <p>For urgent requests, please call us at 0800 123 4567</p>
              </div>
            </div> */}

            <form
              className="space-y-6"
              onSubmit={handlePreview}
            >
              {/* Notice Type Selection */}
              <div className="border-b pb-6">
                <Label className="text-base mb-3 block">
                  Notice Type *
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setNoticeType("death")}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      noticeType === "death"
                        ? "border-[#0f172a] bg-slate-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <h4 className="text-[#0f172a] mb-1">
                      Death Notice
                    </h4>
                    <p className="text-xs text-slate-600">
                      Traditional funeral notice
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoticeType("memorial")}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      noticeType === "memorial"
                        ? "border-[#0f172a] bg-slate-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <h4 className="text-[#0f172a] mb-1">
                      Memorial Service
                    </h4>
                    <p className="text-xs text-slate-600">
                      Announce a memorial event
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoticeType("unveiling")}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      noticeType === "unveiling"
                        ? "border-[#0f172a] bg-slate-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <h4 className="text-[#0f172a] mb-1">
                      Tombstone Unveiling
                    </h4>
                    <p className="text-xs text-slate-600">
                      Unveiling ceremony notice
                    </p>
                  </button>
                </div>
              </div>

              {/* Account Type Selection */}
              <div className="border-b pb-6">
                <Label className="text-base mb-3 block">
                  Account Type *
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAccountType("individual")}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      accountType === "individual"
                        ? "border-[#0f172a] bg-slate-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-[#0f172a]">
                        Individual
                      </h4>
                      <span className="text-2xl text-[#0f172a]">
                        $9.99
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      For families and individuals
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      • Photo upload • 500 words max
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("corporate")}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      accountType === "corporate"
                        ? "border-[#0f172a] bg-slate-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-[#0f172a]">
                        Corporate
                      </h4>
                      <span className="text-2xl text-[#0f172a]">
                        $19.99
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      For funeral homes & businesses
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      • Full flyer upload • Enhanced features
                    </p>
                  </button>
                </div>
              </div>

              {/* Corporate Flyer Upload (Only for Corporate) */}
              {!isIndividual && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileImage className="h-5 w-5 text-purple-700" />
                    <h3 className="text-lg text-[#0f172a]">
                      Corporate Flyer Upload
                    </h3>
                  </div>
                  <p className="text-sm text-slate-700 mb-4">
                    Upload your professionally designed funeral
                    notice flyer or memorial announcement.
                  </p>
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-white">
                    <Upload className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-700 mb-1">
                      Upload Full Flyer/Notice Design
                    </p>
                    <p className="text-xs text-slate-500">
                      PNG, JPG, PDF up to 25MB
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Recommended size: 1200x1600px or A4 format
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 mt-3">
                    <strong>Note:</strong> Corporate accounts
                    can upload complete designs. Your flyer will
                    be displayed as-is on the platform.
                  </p>
                </div>
              )}

              {/* Standard Notice Details (Always show for individuals, optional for corporate) */}
              <div
                className={!isIndividual ? "opacity-60" : ""}
              >
                {!isIndividual && (
                  <p className="text-sm text-slate-600 mb-4 italic">
                    Optional: Fill in these details if you want
                    us to generate a notice for you instead of
                    uploading a flyer.
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      className="mt-1"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          firstName: e.target.value,
                        })
                      }
                      required={isIndividual}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      className="mt-1"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lastName: e.target.value,
                        })
                      }
                      required={isIndividual}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Age"
                      className="mt-1"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          age: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="City or Town"
                      className="mt-1"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: e.target.value,
                        })
                      }
                      required={isIndividual}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <Label htmlFor="birthDate">
                      Date of Birth
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      className="mt-1"
                      value={formData.birthDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          birthDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="passedDate">
                      {noticeType === "death"
                        ? "Date of Passing *"
                        : "Event Date *"}
                    </Label>
                    <Input
                      id="passedDate"
                      type="date"
                      className="mt-1"
                      value={formData.passedDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passedDate: e.target.value,
                        })
                      }
                      required={isIndividual}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Label htmlFor="obituary">
                    {noticeType === "death"
                      ? "Obituary / Tribute *"
                      : "Announcement Details *"}
                  </Label>
                  <Textarea
                    id="obituary"
                    placeholder={
                      noticeType === "death"
                        ? "Share memories and details about your loved one..."
                        : "Provide details about the event..."
                    }
                    className="mt-1 min-h-[150px]"
                    value={formData.obituary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        obituary: e.target.value,
                      })
                    }
                    required={isIndividual}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Maximum 500 words
                  </p>
                </div>

                <div className="mt-6">
                  <Label htmlFor="serviceDetails">
                    {noticeType === "death"
                      ? "Funeral Service Details"
                      : "Event Details"}
                  </Label>
                  <Textarea
                    id="serviceDetails"
                    placeholder="Include venue, date, time, and any special instructions..."
                    className="mt-1 min-h-[100px]"
                    value={formData.serviceDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        serviceDetails: e.target.value,
                      })
                    }
                  />
                </div>

                {isIndividual && (
                  <div className="mt-6">
                    <Label htmlFor="photo">
                      Upload Photo (Optional)
                    </Label>
                    <div className="mt-1 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#0f172a] transition-colors cursor-pointer">
                      <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg text-[#0f172a] mb-4">
                  Your Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contactName">
                      Your Name *
                    </Label>
                    <Input
                      id="contactName"
                      placeholder="Your full name"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">
                      Email Address *
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="your@email.com"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">
                      Phone Number *
                    </Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="Phone number"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationship">
                      Relationship
                    </Label>
                    <Input
                      id="relationship"
                      placeholder="e.g. Son, Daughter, Funeral Director"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <Button
                  type="submit"
                  className="bg-[#0f172a] hover:bg-[#1e3a5f] px-8"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Notice
                </Button>
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <div className="ml-auto text-right">
                  <p className="text-sm text-slate-600">
                    Price:
                  </p>
                  <p className="text-2xl text-[#0f172a]">
                    {price}
                  </p>
                </div>
              </div>
            </form>
          </div>
        </Card>

        {/* Storage & Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg text-[#0f172a] mb-3">
              Notice Permanence
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              All notices remain on our platform permanently,
              creating a lasting digital memorial for your loved
              ones.
            </p>
            <p className="text-xs text-slate-500">
              <strong>Cloud Storage:</strong> We use secure,
              scalable cloud infrastructure with CDN
              optimization to ensure fast loading times
              regardless of the number of notices. Your memories
              are preserved safely and accessible forever.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg text-[#0f172a] mb-3">
              What's Included
            </h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Permanent online presence</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Searchable database</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Social media sharing options</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Email notification to contacts</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <NoticePreview
          noticeData={formData}
          onClose={() => setShowPreview(false)}
          onConfirm={handleConfirmSubmit}
        />
      )}
    </div>
  );
}

