import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import db from "../init/db";
import { User } from "../schemas/userSchema";
import { Notice } from "../schemas/noticeSchema";
import Ad from "../schemas/adSchema";
import { toast } from "sonner";
import { Edit2, Save, X, Trash2, Upload, FileImage, CheckCircle2 } from "lucide-react";
import { NoticeCard } from "./NoticeCard";
import moment from "moment";
import { v4 } from "uuid";
import { routes } from "../init/server";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<User, "user_id">>({
    first_name: "",
    last_name: "",
    organization: false,
    email: "",
    contact_number: "",
    organization_name: null,
    is_admin: false,
  });
  const [userNotices, setUserNotices] = useState<any[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [userAds, setUserAds] = useState<(Ad & { id?: number; photoUrl?: string | null })[]>([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const [showAdForm, setShowAdForm] = useState(false);
  const [editingAdId, setEditingAdId] = useState<number | null>(null);
  const [adFormData, setAdFormData] = useState({
    name: "",
    text: "",
    link: "",
    photo: null as File | null,
  });
  const [adPhotoFile, setAdPhotoFile] = useState<File | null>(null);
  const [selectedTier, setSelectedTier] = useState<"7" | "14" | "30" | null>(null);
  const [selectedTierPrice, setSelectedTierPrice] = useState<number>(0);
  const [isSubmittingAd, setIsSubmittingAd] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await db.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        // Fetch user profile
        const { data: profile, error } = await db
          .from("users")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (error || !profile) {
          // User doesn't have a profile, redirect to onboard
          navigate("/onboard");
          return;
        }

        setUser(profile);
        // Initialize form data with user profile
        setFormData({
          first_name: profile.first_name,
          last_name: profile.last_name,
          organization: profile.organization,
          email: profile.email,
          contact_number: profile.contact_number,
          organization_name: profile.organization_name,
          is_admin: profile.is_admin,
        });
      } catch (error: any) {
        toast.error("Failed to load user data");
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchUserNotices = async () => {
    if (!user) return;

    try {
      setNoticesLoading(true);
      const { data: { session } } = await db.auth.getSession();
      
      if (!session) return;

      const { data, error } = await db
        .from("notices")
        .select("*")
        .eq("user_id", session.user.id)
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching user notices:", error);
        setUserNotices([]);
        return;
      }

      if (!data || data.length === 0) {
        setUserNotices([]);
        return;
      }

      // Transform notices to match NoticeCard format
      const transformedNotices = data.map((notice: Notice & { id?: number; tribute?: number; organization_name?: string | null }, index: number) => {
        // For condolence notices, use organization_name as the name
        const isCondolence = notice.notice_type === "condolence";
        
        let name: string;
        if (isCondolence && notice.organization_name) {
          name = notice.organization_name;
        } else {
          // Build full name from name parts
          const nameParts = [
            notice.first_name,
            notice.middle_name,
            notice.maiden_name,
            notice.last_name
          ].filter(Boolean);
          name = nameParts.join(" ");
        }

        // Calculate age (not applicable for condolence notices)
        const calculateAge = (birthDate: string, passedDate: string | null): number | null => {
          if (!birthDate || !passedDate) return null;
          try {
            const birth = new Date(birthDate);
            const passed = new Date(passedDate);
            let age = passed.getFullYear() - birth.getFullYear();
            const monthDiff = passed.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && passed.getDate() < birth.getDate())) {
              age--;
            }
            return age >= 0 ? age : null;
          } catch {
            return null;
          }
        };

        const age = isCondolence ? 0 : calculateAge(notice.dob, notice.dop);

        // Format dates (not applicable for condolence notices)
        const formatDate = (dateString: string): string => {
          if (!dateString) return "";
          try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          } catch {
            return dateString;
          }
        };

        const formatYearRange = (birthDate: string, passedDate: string | null): string => {
          if (!birthDate && !passedDate) return "";
          try {
            const birth = birthDate ? new Date(birthDate).getFullYear() : null;
            const passed = passedDate ? new Date(passedDate).getFullYear() : null;
            if (birth && passed) {
              return `${birth} - ${passed}`;
            } else if (birth) {
              return `${birth} -`;
            } else if (passed) {
              return `- ${passed}`;
            }
            return "";
          } catch {
            return "";
          }
        };

        const dates = isCondolence ? "" : formatYearRange(notice.dob, notice.dop);
        const date = isCondolence ? "" : formatDate(notice.event_date);

        // Get description
        // For condolence notices, obituary contains the condolence text
        // For death notices, obituary contains the obituary
        // For others, announcement contains the announcement
        const description = notice.notice_type === "condolence"
          ? (notice.obituary || "")
          : notice.notice_type === "death_notice" 
            ? (notice.obituary || "")
            : (notice.announcement || "");

        // Get service details (not applicable for condolence notices)
        const service = isCondolence ? "" : (notice.event_details || "Service details to be announced");

        // Get photo URL
        const getPhotoUrl = (photoId: string | null): string | null => {
          if (!photoId) return null;
          try {
            const { data } = db.storage
              .from("notices")
              .getPublicUrl(photoId);
            return data.publicUrl;
          } catch {
            return null;
          }
        };

        const photoUrl = getPhotoUrl(notice.photo_id);
        const tributeCount = notice.tribute || 0;

        return {
          id: notice.id || index + 1,
          name,
          age: age || 0,
          dates,
          location: isCondolence ? "" : notice.location,
          date,
          description,
          service,
          tributes: tributeCount,
          noticeType: notice.notice_type,
          photoUrl,
          tribute: tributeCount,
        };
      });

      setUserNotices(transformedNotices);
    } catch (error) {
      console.error("Error fetching user notices:", error);
      setUserNotices([]);
    } finally {
      setNoticesLoading(false);
    }
  };

  useEffect(() => {
    fetchUserNotices();
    fetchUserAds();
  }, [user]);

  const getAdPhotoUrl = (photoId: string | null): string | null => {
    if (!photoId) return null;
    try {
      const { data } = db.storage
        .from("ads")
        .getPublicUrl(photoId);
      return data.publicUrl;
    } catch {
      return null;
    }
  };

  const fetchUserAds = async () => {
    if (!user) return;

    try {
      setAdsLoading(true);
      const { data: { session } } = await db.auth.getSession();
      
      if (!session) return;

      const { data, error } = await db
        .from("ads")
        .select("*")
        .eq("user_id", session.user.id)
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching user ads:", error);
        setUserAds([]);
        return;
      }

      if (!data || data.length === 0) {
        setUserAds([]);
        return;
      }

      // Transform ads to include photo URLs
      const transformedAds = data.map((ad: Ad & { id?: number }) => ({
        ...ad,
        photoUrl: getAdPhotoUrl(ad.photo_id),
      }));

      setUserAds(transformedAds);
    } catch (error) {
      console.error("Error fetching user ads:", error);
      setUserAds([]);
    } finally {
      setAdsLoading(false);
    }
  };

  const handleDeleteNotice = async (noticeId: number) => {
    if (!window.confirm("Are you sure you want to delete this notice? This action cannot be undone.")) {
      return;
    }

    try {
      const { data: { session } } = await db.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to delete a notice");
        return;
      }

      // Delete the notice from the database
      const { error } = await db
        .from("notices")
        .delete()
        .eq("id", noticeId)
        .eq("user_id", session.user.id); // Ensure user can only delete their own notices

      if (error) {
        console.error("Error deleting notice:", error);
        toast.error("Failed to delete notice");
        return;
      }

      toast.success("Notice deleted successfully");
      
      // Refresh the notices list
      await fetchUserNotices();
    } catch (error: any) {
      console.error("Error deleting notice:", error);
      toast.error(error.message || "Failed to delete notice");
    }
  };

  const handleSignOut = async () => {
    try {
      await db.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast.error("Failed to sign out");
    }
  };

  const handleEdit = () => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        organization: user.organization,
        email: user.email,
        contact_number: user.contact_number,
        organization_name: user.organization_name,
        is_admin: user.is_admin,
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        organization: user.organization,
        email: user.email,
        contact_number: user.contact_number,
        organization_name: user.organization_name,
        is_admin: user.is_admin,
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!formData.first_name || !formData.last_name || !formData.contact_number) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.organization && !formData.organization_name) {
      toast.error("Please enter your organization name");
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await db.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        organization: formData.organization,
        contact_number: formData.contact_number,
        organization_name: formData.organization ? formData.organization_name : null,
      };

      const { error, data } = await db
        .from("users")
        .update(updateData)
        .eq("user_id", session.user.id).single();

      console.log(error);
      console.log(data)
      if (error) {
        toast.error(error.message || "Failed to update profile");
        setSaving(false);
        return;
      }

      // Update local user state
      const updatedUser: User = {
        ...user,
        ...updateData,
      };
      setUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleOrganizationChange = () => {
    const newOrganizationValue = !formData.organization;
    setFormData({
      ...formData,
      organization: newOrganizationValue,
      organization_name: newOrganizationValue ? formData.organization_name : null,
    });
  };

  const uploadAdPhoto = async (): Promise<string> => {
    if (!adPhotoFile) {
      throw new Error("No photo file selected");
    }

    try {
      const { data: { session } } = await db.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Generate unique filename
      const fileExt = adPhotoFile.name.split(".").pop();
      const fileName = `${v4()}.${fileExt}`;

      // Upload to Supabase storage (ads bucket)
      const { data, error } = await db.storage
        .from("ads")
        .upload(fileName, adPhotoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Return filename instead of public URL
      return fileName;
    } catch (error: any) {
      console.error("Error uploading ad photo:", error);
      throw new Error(error.message || "Failed to upload photo");
    }
  };

  const handleAdPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdPhotoFile(file);
      setAdFormData({ ...adFormData, photo: file });
    }
  };

  const handleEditAd = (ad: Ad & { id?: number; photoUrl?: string | null }) => {
    if (ad.status !== "rejected") return;
    
    setEditingAdId(ad.id || null);
    setAdFormData({
      name: ad.name,
      text: ad.text,
      link: ad.link,
      photo: null,
    });
    setAdPhotoFile(null);
    setSelectedTier(null);
    setSelectedTierPrice(0);
    
    setShowAdForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEditAd = () => {
    setEditingAdId(null);
    setShowAdForm(false);
    setAdFormData({
      name: "",
      text: "",
      link: "",
      photo: null,
    });
    setAdPhotoFile(null);
    setSelectedTier(null);
  };

  const handleCreateAd = async () => {
    // Payment tier is only required when creating a new ad, not when editing
    if (!editingAdId && !selectedTier) {
      toast.error("Please select a payment tier");
      return;
    }

    if (!adFormData.name || !adFormData.text || !adFormData.link) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Photo is required only for new ads, optional for editing
    if (!editingAdId && !adPhotoFile) {
      toast.error("Please upload an ad photo");
      return;
    }

    setIsSubmittingAd(true);
    try {
      const { data: { session } } = await db.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // If editing an existing ad, update it in the database
      if (editingAdId) {
        const existingAd = userAds.find(ad => ad.id === editingAdId);
        if (!existingAd) {
          toast.error("Ad not found");
          setIsSubmittingAd(false);
          return;
        }

        // Only allow editing rejected ads
        if (existingAd.status !== "rejected") {
          toast.error("Only rejected ads can be edited");
          setIsSubmittingAd(false);
          return;
        }

        // Upload new photo only if a new file is selected
        let photoFileName = existingAd.photo_id;
        if (adPhotoFile) {
          try {
            photoFileName = await uploadAdPhoto();
          } catch (error: any) {
            toast.error(error.message || "Failed to upload photo");
            setIsSubmittingAd(false);
            return;
          }
        }

        // Keep the original expiration date when editing
        const expiresDate = existingAd.expires;

        // Update ad in database
        const { error: updateError } = await db
          .from("ads")
          .update({
            name: adFormData.name,
            text: adFormData.text,
            link: adFormData.link,
            photo_id: photoFileName,
            expires: expiresDate,
            status: "pending",
            rejection_reason: null,
          })
          .eq("id", editingAdId)
          .eq("user_id", session.user.id);

        if (updateError) {
          throw new Error(updateError.message || "Failed to update ad");
        }

        toast.success("Ad updated successfully! Waiting for admin approval.");
        handleCancelEditAd();
        await fetchUserAds();
        setIsSubmittingAd(false);
        return;
      }

      // Upload photo for new ad
      let photoFileName: string;
      try {
        photoFileName = await uploadAdPhoto();
      } catch (error: any) {
        toast.error(error.message || "Failed to upload photo");
        setIsSubmittingAd(false);
        return;
      }

      // Calculate expires date using moment
      const days = parseInt(selectedTier || "7");
      const expiresDate = moment().add(days, "days").format("YYYY-MM-DD");

      // Create ad data
      const adData: Ad = {
        name: adFormData.name,
        text: adFormData.text,
        link: adFormData.link,
        photo_id: photoFileName,
        expires: expiresDate,
        clicks: 0,
        user_id: session.user.id,
        active: false,
        total: selectedTierPrice,
        // total: 0.01,
        reference_number: null,
        currency: "usd",
        redirect_url: null,
        paid: false,
        status: "pending",
        rejection_reason: null,
      };

      // Submit to API endpoint
      console.log(adData);
      const req = await axios.post(routes.initiate_ad_transaction, adData);
      console.log(req);

      if (req.status !== 200) {
        throw new Error("Failed to submit ad");
      }

      toast.success("Success. Redirecting to checkout...");
      localStorage.setItem("reference_number", req.data.reference_number);
      navigate(req.data.payment_url);
      setShowAdForm(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create ad");
    } finally {
      setIsSubmittingAd(false);
    }
  };

  const paymentTiers = [
    { days: 7, price: 100, label: "7 Days" },
    { days: 14, price: 200, label: "2 Weeks" },
    { days: 30, price: 350, label: "1 Month" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap flex-col md:flex-row gap-2 justify-between items-center w-full">
          <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>

          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate("/place")}>
              Place a Notice
            </Button>
            {
              user.is_admin && (
                <>
                  <Button onClick={() => navigate("/manage_ads")} variant="outline">
                    Manage Ads
                  </Button>
                </>
              )
            }
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" onClick={handleEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 py-4">
            {isEditing ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      required
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number *</Label>
                  <Input
                    id="contact_number"
                    type="tel"
                    value={formData.contact_number}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_number: e.target.value })
                    }
                    required
                    disabled={saving}
                    placeholder="+1234567890"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input 
                    id="organization"
                    type="checkbox" 
                    checked={formData.organization} 
                    onChange={handleOrganizationChange}
                    className="mr-2"
                    disabled={saving}
                  />
                  <Label htmlFor="organization" className="cursor-pointer">
                    I am representing an organization
                  </Label>
                </div>

                {formData.organization && (
                  <div className="space-y-2">
                    <Label htmlFor="organization_name">Organization Name *</Label>
                    <Input
                      id="organization_name"
                      value={formData.organization_name || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organization_name: e.target.value,
                        })
                      }
                      required={formData.organization}
                      disabled={saving}
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg">
                    {user.first_name} {user.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                  <p className="text-lg">{user.contact_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                  <p className="text-lg">
                    {user.organization ? "Organization" : "Individual"}
                  </p>
                </div>
                {user.organization && user.organization_name && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Organization Name</p>
                    <p className="text-lg">{user.organization_name}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        {user.organization && <>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Create Advertisement</CardTitle>
                <CardDescription>Create a new ad to promote your business</CardDescription>
              </div>
              {!showAdForm && (
                <Button onClick={() => {
                  setEditingAdId(null);
                  setAdFormData({
                    name: "",
                    text: "",
                    link: "",
                    photo: null,
                  });
                  setAdPhotoFile(null);
                  setSelectedTier(null);
                  setShowAdForm(true);
                }}>
                  Create Ad
                </Button>
              )}
            </div>
          </CardHeader>
          {showAdForm && (
            <CardContent className="space-y-4 py-4">
              {editingAdId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Editing rejected ad.</strong> Make your changes and resubmit for admin review.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="ad_name">Headline *</Label>
                <Input
                  id="ad_name"
                  value={adFormData.name}
                  onChange={(e) =>
                    setAdFormData({ ...adFormData, name: e.target.value })
                  }
                  placeholder="Enter ad name/company/headline"
                  required
                  disabled={isSubmittingAd}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ad_text">Ad Text *</Label>
                <Textarea
                  id="ad_text"
                  value={adFormData.text}
                  onChange={(e) =>
                    setAdFormData({ ...adFormData, text: e.target.value })
                  }
                  maxLength={50}
                  placeholder="Enter ad description/text. Maximum 50 characters."
                  required
                  disabled={isSubmittingAd}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ad_link">Link *</Label>
                <Input
                  id="ad_link"
                  type="url"
                  value={adFormData.link}
                  onChange={(e) =>
                    setAdFormData({ ...adFormData, link: e.target.value })
                  }
                  placeholder="https://example.com"
                  required
                  disabled={isSubmittingAd}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ad_photo">
                  Ad Photo {editingAdId ? "(Optional - leave empty to keep current)" : "*"}
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    id="ad_photo"
                    accept="image/*"
                    onChange={handleAdPhotoChange}
                    className="hidden"
                    disabled={isSubmittingAd}
                  />
                  <label
                    htmlFor="ad_photo"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="h-4 w-4" />
                    {adPhotoFile ? adPhotoFile.name : "Upload Photo"}
                  </label>
                  {adPhotoFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileImage className="h-4 w-4" />
                      {adPhotoFile.name}
                    </div>
                  )}
                </div>
              </div>

              {!editingAdId && (
                <>
                  <div className="space-y-2">
                    <Label>Payment Tier *</Label>
                    <div className="grid md:grid-cols-3 gap-4">
                      {paymentTiers.map((tier) => (
                        <Card
                          key={tier.days}
                          className={`cursor-pointer transition-all ${
                            selectedTier === tier.days.toString()
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            {!isSubmittingAd &&
                            setSelectedTier(tier.days.toString() as "7" | "14" | "30")
                            setSelectedTierPrice(tier.price);
                            }
                          }
                        >
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                ${tier.price}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {tier.label}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p><small>Paying for ad does not guarantee placement. Ad will be reviewed and approved by admin. No refunds!</small></p>
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateAd}
                  disabled={isSubmittingAd}
                >
                  {isSubmittingAd 
                    ? (editingAdId ? "Updating..." : "Creating...") 
                    : (editingAdId ? "Update Ad" : "Create Ad")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEditAd}
                  disabled={isSubmittingAd}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Advertisements</CardTitle>
            <CardDescription>Advertisements you have created</CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            {adsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading ads...
              </div>
            ) : userAds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">You haven't created any ads yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userAds.map((ad) => (
                  <Card key={ad.id} className="relative">
                    <CardContent className="p-4">
                      {ad.photoUrl && (
                        <img 
                          src={ad.photoUrl} 
                          alt={ad.name}
                          className="w-full h-48 object-cover rounded-md mb-4"
                        />
                      )}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{ad.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{ad.text}</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ad.status === "approved" && ad.active
                              ? "bg-green-100 text-green-800"
                              : ad.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {ad.status === "approved" && ad.active
                              ? "Active"
                              : ad.status === "rejected"
                              ? "Rejected"
                              : "Pending"}
                          </span>
                          {ad.paid && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Paid
                            </span>
                          )}
                        </div>
                        {ad.status === "rejected" && ad.rejection_reason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                            <p className="text-sm text-red-700">{ad.rejection_reason}</p>
                          </div>
                        )}
                        <div className="flex gap-2 mt-4">
                          {ad.status === "rejected" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditAd(ad)}
                              className="flex-1"
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit & Resubmit
                            </Button>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Expires: {moment(ad.expires).format("MMM DD, YYYY")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </>}

        <Card>
          <CardHeader>
            <CardTitle>My Notices</CardTitle>
            <CardDescription>Notices you have placed on the site</CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            {noticesLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading notices...
              </div>
            ) : userNotices.length === 0 ? (
              <></>
              // <div className="text-center py-8 text-muted-foreground">
              //   <p className="mb-4">You haven't placed any notices yet.</p>
              //   <Button onClick={() => navigate("/place")}>
              //     Place a Notice
              //   </Button>
              // </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userNotices.map((notice) => (
                  <NoticeCard 
                    key={notice.id} 
                    notice={notice} 
                    onDelete={() => handleDeleteNotice(notice.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

