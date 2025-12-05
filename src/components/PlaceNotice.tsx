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
import { toast } from "sonner";
import type { Notice } from "../schemas/noticeSchema";
import {v4} from "uuid";
import { routes } from "../init/server";
import axios from "axios";

export function PlaceNotice() {
  const navigate = useNavigate();
  const [noticeType, setNoticeType] = useState<Notice["notice_type"]>("death_notice");
  const [accountType, setAccountType] = useState<"individual" | "corporate">("individual");
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    maidenName: "",
    lastName: "",
    nickname: "",
    location: "",
    birthDate: "",
    passedDate: "",
    dateOfPassing: "",
    obituary: "",
    serviceDetails: "",
    photo: "",
    noticeType: "Death Notice",
    relationship: "",
  });
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [total,set_total]=useState<number>(0);

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();

    // Get the notice type label
    const noticeTypeLabel =
      noticeType === "death_notice"
        ? "Death Notice"
        : noticeType === "memorial_service"
          ? "Memorial Service"
          : "Tombstone Unveiling";

    setFormData({
      ...formData,
      noticeType: noticeTypeLabel,
    });
    setShowPreview(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo size must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      // Create a preview URL for the form
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          photo: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoAreaClick = (inputId: string = "photo") => {
    const fileInput = document.getElementById(inputId) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const uploadPhoto = async (): Promise<string> => {
    if (!photoFile) {
      return "";
    }

    try {
      const { data: { session } } = await db.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Generate unique filename
      const fileExt = photoFile.name.split(".").pop();
      const fileName = `${v4()}.${fileExt}`;

      // Upload to Supabase storage
      const { data, error } = await db.storage
        .from("notices")
        .upload(fileName, photoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Return filename instead of public URL
      return fileName;
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      throw new Error(error.message || "Failed to upload photo");
    }
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Get user session
      const { data: { session } } = await db.auth.getSession();
      if (!session) {
        toast.error("Please log in to submit a notice");
        navigate("/auth");
        return;
      }

      // Validate required fields
      if (isIndividual) {
        if (!formData.firstName || !formData.lastName || !formData.location || !formData.passedDate || !formData.obituary) {
          toast.error("Please fill in all required fields");
          setIsSubmitting(false);
          return;
        }
      }

      // Upload photo if provided
      let photoFileName: string | null = null;
      if (photoFile) {
        try {
          photoFileName = await uploadPhoto();
        } catch (error: any) {
          toast.error(error.message || "Failed to upload photo");
          setIsSubmitting(false);
          return;
        }
      }

      // Map form data to schema
      const noticeData: Notice & {currency:"usd"|"ZiG", total: number} = {
        notice_type: noticeType,
        user_id: session.user.id,
        first_name: formData.firstName,
        middle_name: formData.middleName || null,
        maiden_name: formData.maidenName || null,
        nickname: formData.nickname || null,
        last_name: formData.lastName,
        location: formData.location,
        dob: formData.birthDate || "",
        dop: noticeType === "death_notice" 
          ? formData.passedDate 
          : (noticeType === "memorial_service" || noticeType === "tombstone_unveiling")
            ? (formData.dateOfPassing || null)
            : null,
        event_date: formData.passedDate,
        event_details: formData.serviceDetails || "",
        obituary: noticeType === "death_notice" ? formData.obituary : null,
        announcement: noticeType !== "death_notice" ? formData.obituary : null,
        photo_id: photoFileName || null,
        relationship: formData.relationship || "",
        active: false,
        reference_number: null,
        redirect_url: null,
        currency:"usd",
        total:total	,
      };

      // Submit to api
      console.log(noticeData);
      const req = await axios.post(routes.intiate_transaction, noticeData);
      console.log(req)
      // const response = await fetch(routes.intiate_transaction, {
      //   method: "POST",
      //   body: JSON.stringify(noticeData),
      // });
     

      if (req.status !== 200) {
        throw new Error("Failed to submit notice");
      }
      toast.success("Success. Redirecting to checkout...");
      localStorage.setItem("reference_number", req.data.reference_number);
      navigate(req.data.payment_url);
      setShowPreview(false);
      
      // Reset form
     
     
    } catch (error: any) {
      console.error("Error submitting notice:", error);
      toast.error(error.message || "Failed to submit notice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
    // Automatically set account type based on user's organization status
    if (profile.organization) {
      setAccountType("corporate");
      set_total(19.99);
    } else {
      setAccountType("individual");
      set_total(9.99);
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
                    onClick={() => setNoticeType("death_notice")}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      noticeType === "death_notice"
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
                    onClick={() => setNoticeType("memorial_service")}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      noticeType === "memorial_service"
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
                    onClick={() => setNoticeType("tombstone_unveiling")}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      noticeType === "tombstone_unveiling"
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
                  <div
                    onClick={() => handlePhotoAreaClick("photo-corporate")}
                    className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-white"
                  >
                    <input
                      id="photo-corporate"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Upload className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-700 mb-1">
                      Upload Full Flyer/Notice Design
                    </p>
                    <p className="text-xs text-slate-500">
                      PNG, JPG up to 5MB
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Recommended size: 1080x1080px
                    </p>
                    {photoFile && (
                      <p className="text-xs text-green-600 mt-2">
                        Selected: {photoFile.name}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-3">
                    <strong>Note:</strong> Corporate accounts
                    can upload complete designs. Your flyer will
                    be displayed as-is on the platform. You can also
                    fill in the form details below to provide additional information.
                  </p>
                </div>
              )}

              {/* Standard Notice Details */}
              <div>
                {!isIndividual && (
                  <p className="text-sm text-slate-600 mb-4">
                    Fill in these details to provide additional information
                    along with your flyer, or use them to generate a notice.
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <Label htmlFor="middleName">
                      Middle Name
                    </Label>
                    <Input
                      id="middleName"
                      placeholder="Enter middle name"
                      className="mt-1"
                      value={formData.middleName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          middleName: e.target.value,
                        })
                      }
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
                    <Label htmlFor="maidenName">
                      Maiden Name
                    </Label>
                    <Input
                      id="maidenName"
                      placeholder="Enter maiden name"
                      className="mt-1"
                      value={formData.maidenName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maidenName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="nickname">
                      Nickname
                    </Label>
                    <Input
                      id="nickname"
                      placeholder="Enter nickname (optional)"
                      className="mt-1"
                      value={formData.nickname}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nickname: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
                  <div>
                    <Label htmlFor="relationship">
                      Relationship
                    </Label>
                    <Input
                      id="relationship"
                      placeholder="e.g. Son, Daughter, Funeral Director"
                      className="mt-1"
                      value={formData.relationship}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          relationship: e.target.value,
                        })
                      }
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
                  {noticeType === "death_notice" ? (
                    <div>
                      <Label htmlFor="passedDate">
                        Date of Passing *
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
                  ) : (
                    <div>
                      <Label htmlFor="dateOfPassing">
                        Date of Passing
                      </Label>
                      <Input
                        id="dateOfPassing"
                        type="date"
                        className="mt-1"
                        value={formData.dateOfPassing}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dateOfPassing: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
                {(noticeType === "memorial_service" || noticeType === "tombstone_unveiling") && (
                  <div className="mt-6">
                    <Label htmlFor="passedDate">
                      Event Date *
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
                )}

                <div className="mt-6">
                  <Label htmlFor="obituary">
                    {noticeType === "death_notice"
                      ? "Obituary / Tribute *"
                      : "Announcement Details *"}
                  </Label>
                  <Textarea
                    id="obituary"
                    placeholder={
                      noticeType === "death_notice"
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
                    {noticeType === "death_notice"
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
                    <Label>
                      Upload Photo (Optional)
                    </Label>
                    <div
                      onClick={() => handlePhotoAreaClick("photo-individual")}
                      className="mt-1 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#0f172a] transition-colors cursor-pointer block"
                    >
                      <input
                        id="photo-individual"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">
                        PNG, JPG up to 5MB
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Recommended size: 1080x1080px for best view
                      </p>
                      {photoFile && (
                        <p className="text-xs text-green-600 mt-2">
                          Selected: {photoFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-6">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <Button
                    type="submit"
                    className="bg-[#0f172a] hover:bg-[#1e3a5f] px-8"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Notice
                  </Button>
                 
                </div>
                <div className="text-center sm:text-right sm:ml-auto border-t sm:border-t-0 pt-4 sm:pt-0">
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

     
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <NoticePreview
          noticeData={formData}
          onClose={() => setShowPreview(false)}
          onConfirm={handleConfirmSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

