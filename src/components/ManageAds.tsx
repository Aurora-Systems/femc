import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import db from "../init/db";
import Ad from "../schemas/adSchema";
import { toast } from "sonner";
import { Trash2, CheckCircle2, Loader2, Eye, X } from "lucide-react";
import moment from "moment";

export default function ManageAds() {
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<(Ad & { id?: number; photoUrl?: string | null; userName?: string })[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad & { id?: number; photoUrl?: string | null } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [editedStatus, setEditedStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [editedActive, setEditedActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const reviewCardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetchAds();
  }, []);

  const checkAdminAndFetchAds = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await db.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      const { data: profile, error: profileError } = await db
        .from("users")
        .select("is_admin")
        .eq("user_id", session.user.id)
        .single();

      if (profileError || !profile) {
        toast.error("Failed to verify admin status");
        navigate("/dashboard");
        return;
      }

      if (!profile.is_admin) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await fetchAds();
    } catch (error: any) {
      console.error("Error checking admin status:", error);
      toast.error("Failed to load page");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

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

  const fetchAds = async () => {
    setAdsLoading(true);
    try {
      const { data, error } = await db
        .from("ads")
        .select(`
          *
        `)
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching ads:", error);
        toast.error("Failed to fetch ads");
        return;
      }

      if (!data || data.length === 0) {
        setAds([]);
        return;
      }

      // Transform ads to include photo URLs and user names
      const transformedAds = data.map((ad: any) => {
        const user = ad.users;
        const userName = user?.organization_name 
          ? user.organization_name 
          : user 
            ? `${user.first_name} ${user.last_name}`
            : "Unknown User";

        return {
          ...ad,
          photoUrl: getAdPhotoUrl(ad.photo_id),
          userName,
        };
      });

      setAds(transformedAds);
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast.error("Failed to fetch ads");
    } finally {
      setAdsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedAd?.id) return;

    // Validate rejection reason if status is rejected
    if (editedStatus === "rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason when rejecting an ad");
      return;
    }

    setIsSaving(true);
    try {
      const updateData: any = {
        status: editedStatus,
        active: editedActive,
      };

      // Only update rejection_reason if status is rejected, otherwise clear it
      if (editedStatus === "rejected") {
        updateData.rejection_reason = rejectionReason.trim();
      } else {
        updateData.rejection_reason = null;
      }

      const { error } = await db
        .from("ads")
        .update(updateData)
        .eq("id", selectedAd.id);

      if (error) {
        throw new Error(error.message || "Failed to update ad");
      }

      toast.success("Ad updated successfully!");
      closeReview();
      await fetchAds();
    } catch (error: any) {
      toast.error(error.message || "Failed to update ad");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (adId: number) => {
    if (!window.confirm("Are you sure you want to delete this ad? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await db
        .from("ads")
        .delete()
        .eq("id", adId);

      if (error) {
        throw new Error(error.message || "Failed to delete ad");
      }

      toast.success("Ad deleted successfully!");
      await fetchAds();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete ad");
    } finally {
      setIsDeleting(false);
    }
  };

  const openReview = (ad: Ad & { id?: number; photoUrl?: string | null }) => {
    setSelectedAd(ad);
    setRejectionReason(ad.rejection_reason || "");
    setEditedStatus(ad.status);
    setEditedActive(ad.active);
    // Scroll to top after state update
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Also try to scroll to the review card if it exists
      if (reviewCardRef.current) {
        reviewCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const closeReview = () => {
    setSelectedAd(null);
    setRejectionReason("");
    setEditedStatus("pending");
    setEditedActive(false);
  };

  const filteredAds = filterStatus === "all" 
    ? ads 
    : ads.filter(ad => ad.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap flex-col md:flex-row gap-4 justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Manage Advertisements</h1>
            <p className="text-muted-foreground mt-1">Review, approve, reject, or delete ads</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Review Card */}
        {selectedAd && (
          <div ref={reviewCardRef}>
            <Card className="border-blue-200 bg-blue-50 py-4">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Review Advertisement</CardTitle>
                  <CardDescription>
                    Review and update ad status and active state
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeReview}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedAd.photoUrl && (
                <img 
                  src={selectedAd.photoUrl} 
                  alt={selectedAd.name}
                  className="w-full max-w-md h-48 object-cover rounded-md"
                />
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Company/Headline</Label>
                  <p className="text-base">{selectedAd.name}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Ad Text</Label>
                  <p className="text-base">{selectedAd.text}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Link</Label>
                  <a 
                    href={selectedAd.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all text-sm"
                  >
                    {selectedAd.link}
                  </a>
                </div>

                <div>
                  <Label className="text-sm font-medium">Expires</Label>
                  <p className="text-base">{moment(selectedAd.expires).format("MMM DD, YYYY")}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Clicks</Label>
                  <p className="text-base">{selectedAd.clicks || 0}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Paid</Label>
                  <p className="text-base">{selectedAd.paid ? "Yes" : "No"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                {/* Status Select */}
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    value={editedStatus}
                    onChange={(e) => {
                      const value = e.target.value as "pending" | "approved" | "rejected";
                      setEditedStatus(value);
                      // Auto-set active based on status
                      if (value === "approved") {
                        setEditedActive(true);
                      } else if (value === "rejected") {
                        setEditedActive(false);
                      }
                    }}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="active"
                    checked={editedActive}
                    onChange={(e) => setEditedActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={editedStatus !== "approved"}
                  />
                  <Label htmlFor="active" className="cursor-pointer">
                    Set as Active
                  </Label>
                </div>
                {editedStatus !== "approved" && (
                  <p className="text-xs text-muted-foreground col-span-2">
                    Note: Only approved ads can be set as active
                  </p>
                )}

                {/* Rejection Reason */}
                {editedStatus === "rejected" && (
                  <div className="col-span-2">
                    <Label htmlFor="rejection_reason">Rejection Reason *</Label>
                    <Textarea
                      id="rejection_reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection (required)"
                      rows={3}
                      className="mt-1"
                      required
                    />
                  </div>
                )}

                {/* Show existing rejection reason if status was rejected before */}
                {selectedAd.status === "rejected" && selectedAd.rejection_reason && editedStatus !== "rejected" && (
                  <div className="col-span-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <Label className="text-sm font-medium text-yellow-800">Previous Rejection Reason:</Label>
                    <p className="text-sm text-yellow-700 mt-1">{selectedAd.rejection_reason}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={closeReview}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            size="sm"
          >
            All ({ads.length})
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            onClick={() => setFilterStatus("pending")}
            size="sm"
          >
            Pending ({ads.filter(a => a.status === "pending").length})
          </Button>
          <Button
            variant={filterStatus === "approved" ? "default" : "outline"}
            onClick={() => setFilterStatus("approved")}
            size="sm"
          >
            Approved ({ads.filter(a => a.status === "approved").length})
          </Button>
          <Button
            variant={filterStatus === "rejected" ? "default" : "outline"}
            onClick={() => setFilterStatus("rejected")}
            size="sm"
          >
            Rejected ({ads.filter(a => a.status === "rejected").length})
          </Button>
        </div>

        {/* Ads list */}
        {adsLoading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading ads...</p>
          </div>
        ) : filteredAds.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No ads found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <Card key={ad.id} className="relative">
                <CardContent className="p-4">
                  {ad.photoUrl && (
                    <img 
                      src={ad.photoUrl} 
                      alt={ad.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{ad.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ad.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        By: {ad.userName || "Unknown"}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
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
                      <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
                        <p className="text-xs text-red-700">{ad.rejection_reason}</p>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Link: <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">{ad.link}</a></p>
                      <p>Expires: {moment(ad.expires).format("MMM DD, YYYY")}</p>
                      <p>Clicks: {ad.clicks || 0}</p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReview(ad)}
                        className="flex-1"
                        disabled={selectedAd?.id === ad.id}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {selectedAd?.id === ad.id ? "Currently Reviewing" : "Review"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(ad.id!)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

