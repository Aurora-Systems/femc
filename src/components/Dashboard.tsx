import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import db from "../init/db";
import { User } from "../schemas/userSchema";
import { toast } from "sonner";
import { Edit2, Save, X } from "lucide-react";

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
  });
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

      const { error } = await db
        .from("users")
        .update(updateData)
        .eq("user_id", session.user.id);

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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap flex-col md:flex-row gap-2 justify-between items-center w-full">
          <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>

          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate("/place")}>
              Place a Notice
            </Button>
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
      </div>
    </div>
  );
}

