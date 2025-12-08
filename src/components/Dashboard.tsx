import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import db from "../init/db";
import { User } from "../schemas/userSchema";
import { Notice } from "../schemas/noticeSchema";
import { toast } from "sonner";
import { Edit2, Save, X, Trash2 } from "lucide-react";
import { NoticeCard } from "./NoticeCard";

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
      const transformedNotices = data.map((notice: Notice & { id?: number; tribute?: number }, index: number) => {
        const nameParts = [
          notice.first_name,
          notice.middle_name,
          notice.maiden_name,
          notice.last_name
        ].filter(Boolean);
        const name = nameParts.join(" ");

        // Calculate age
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

        const age = calculateAge(notice.dob, notice.dop);

        // Format dates
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

        const dates = formatYearRange(notice.dob, notice.dop);
        const date = formatDate(notice.event_date);

        // Get description
        const description = notice.notice_type === "death_notice" 
          ? (notice.obituary || "")
          : (notice.announcement || "");

        // Get service details
        const service = notice.event_details || "Service details to be announced";

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
          location: notice.location,
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
  }, [user]);

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
                <Button onClick={() => navigate("/manage_ads")}>
                  Manage Ads
                </Button>
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
          <CardContent className="space-y-4">
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

        <Card>
          <CardHeader>
            <CardTitle>My Notices</CardTitle>
            <CardDescription>Notices you have placed on the site</CardDescription>
          </CardHeader>
          <CardContent>
            {noticesLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading notices...
              </div>
            ) : userNotices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">You haven't placed any notices yet.</p>
                <Button onClick={() => navigate("/place")}>
                  Place a Notice
                </Button>
              </div>
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

