import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import db from "../init/db";
import { User } from "../schemas/userSchema";
import Ad from "../schemas/adSchema";
import { toast } from "sonner";
import { Edit2, Save, X, Plus, Upload, Trash2 } from "lucide-react";
import { v4 } from "uuid";

interface AdWithId extends Ad {
  id?: number;
  photoUrl?: string | null;
}

const ManageAds = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<AdWithId[]>([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<Ad, "clicks">>({
    name: "",
    text: "",
    link: "",
    photo_id: "",
    expires: "",
    user_id: ""
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await db.auth.getSession();
        
        if (!session) {
          navigate("/");
          return;
        }

        // Fetch user profile
        const { data: profile, error } = await db
          .from("users")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (error || !profile) {
          navigate("/");
          return;
        }

        // Check if user is admin
        if (!profile.is_admin) {
          toast.error("Access denied. Admin privileges required.");
          navigate("/");
          return;
        }

        setUser(profile);
      } catch (error: any) {
        toast.error("Failed to load user data");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchAds = async () => {
    try {
      setAdsLoading(true);
      const { data, error } = await db
        .from("ads")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching ads:", error);
        toast.error("Failed to fetch ads");
        setAds([]);
        return;
      }

      if (!data || data.length === 0) {
        setAds([]);
        return;
      }

      // Transform ads to include photo URLs
      const transformedAds = data.map((ad: AdWithId) => ({
        ...ad,
        photoUrl: getAdPhotoUrl(ad.photo_id),
      }));

      setAds(transformedAds);
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast.error("Failed to fetch ads");
      setAds([]);
    } finally {
      setAdsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.is_admin) {
      fetchAds();
    }
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo size must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
        .from("ads")
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

  const resetForm = () => {
    setFormData({
      name: "",
      text: "",
      link: "",
      photo_id: "",
      expires: "",
      user_id:user?.user_id || "",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleEdit = (ad: AdWithId) => {
    setFormData({
      name: ad.name,
      text: ad.text,
      link: ad.link,
      photo_id: ad.photo_id,
      expires: ad.expires,
      user_id: ad.user_id,
    });
    setPhotoFile(null);
    setPhotoPreview(ad.photoUrl || null);
    setEditingId(ad.id || null);
    setIsAdding(false);
    // Scroll to top when editing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (adId: number, adName: string) => {
    if (!window.confirm(`Are you sure you want to delete the ad "${adName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await db
        .from("ads")
        .delete()
        .eq("id", adId);

      if (error) {
        console.error("Error deleting ad:", error);
        toast.error("Failed to delete ad");
        return;
      }

      toast.success("Ad deleted successfully");
      await fetchAds();
    } catch (error: any) {
      console.error("Error deleting ad:", error);
      toast.error(error.message || "Failed to delete ad");
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleSave = async () => {
    if (!formData.name || !formData.text || !formData.link || !formData.expires) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await db.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in");
        navigate("/");
        return;
      }

      let photoId = formData.photo_id;

      // Upload new photo if one was selected
      if (photoFile) {
        photoId = await uploadPhoto();
      }

      const adData = {
        name: formData.name,
        text: formData.text,
        link: formData.link,
        photo_id: photoId || null,
        expires: formData.expires,
        clicks: editingId 
          ? ads.find(a => a.id === editingId)?.clicks || 0
          : 0,
        user_id: user?.user_id || "",
      };

      if (editingId) {
        // Update existing ad
        const { error } = await db
          .from("ads")
          .update(adData)
          .eq("id", editingId);

        if (error) {
          toast.error(error.message || "Failed to update ad");
          return;
        }

        toast.success("Ad updated successfully");
      } else {
        // Create new ad
        const { error } = await db
          .from("ads")
          .insert([adData]);

        if (error) {
          toast.error(error.message || "Failed to create ad");
          return;
        }

        toast.success("Ad created successfully");
      }

      resetForm();
      await fetchAds();
    } catch (error: any) {
      console.error("Error saving ad:", error);
      toast.error(error.message || "Failed to save ad");
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap flex-col md:flex-row gap-2 justify-between items-center w-full">
          <div>
            <h1 className="text-3xl font-bold">Manage Ads</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isAdding && !editingId && (
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Ad
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>

        {(isAdding || editingId) && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit Ad" : "Add New Ad"}</CardTitle>
              <CardDescription>
                {editingId ? "Update the ad details below" : "Fill in the details to create a new ad"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    disabled={saving}
                    placeholder="Enter ad name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link">Link *</Label>
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    required
                    disabled={saving}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text">Ad Text *</Label>
                <Textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  required
                  disabled={saving}
                  placeholder="Enter ad description/text, 3-5 words are best"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires">Expiration Date *</Label>
                <Input
                  id="expires"
                  type="date"
                  value={formData.expires}
                  onChange={(e) =>
                    setFormData({ ...formData, expires: e.target.value })
                  }
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={saving}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("photo")?.click()}
                      disabled={saving}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {photoFile ? "Change Photo" : "Upload Photo"}
                    </Button>
                  </div>
                  {photoPreview && (
                    <div className="w-32 h-32 border rounded-lg overflow-hidden">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Photo size must be less than 5MB. If no new photo is selected, the existing photo will be kept.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Ads</CardTitle>
            <CardDescription>Manage existing ads on the site</CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            {adsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading ads...
              </div>
            ) : ads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">No ads found.</p>
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Ad
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map((ad) => (
                  <Card 
                    key={ad.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                  
                  >
                    <CardContent className="p-0">
                      {/* Image on top */}
                      {ad.photoUrl ? (
                        <div className="w-full h-48 overflow-hidden rounded-t-lg">
                          <img
                            src={ad.photoUrl}
                            alt={ad.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
                          <p className="text-muted-foreground text-sm">No image</p>
                        </div>
                      )}
                      
                      {/* Details on bottom */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1">{ad.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{ad.text}</p>
                          </div>
                          {/* <Edit2 className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" /> */}
                        </div>
                        
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>
                            <span className="font-medium">Link:</span>{" "}
                            <a 
                              href={ad.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:underline truncate block"
                              title={ad.link}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {ad.link}
                            </a>
                          </p>
                          <p>
                            <span className="font-medium">Expires:</span>{" "}
                            {new Date(ad.expires).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="font-medium">Clicks:</span> {ad.clicks || 0}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1" 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isAdding && editingId === null) {
                                handleEdit(ad);
                              }
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1" 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isAdding && editingId === null && ad.id) {
                                handleDelete(ad.id, ad.name);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                     
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageAds;
