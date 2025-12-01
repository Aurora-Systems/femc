import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import db from "../init/db";
import { User } from "../schemas/userSchema";
import { toast } from "sonner";

export default function Onboard() {
  const [loading, setLoading] = useState(false);
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

        // Check if user already has a profile
        const { data: profile } = await db
          .from("users")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (profile) {
          navigate("/dashboard");
          return;
        }

        // Set email from session
        if (session.user.email) {
          setFormData((prev) => ({ ...prev, email: session.user.email! }));
        }
      } catch (error: any) {
        toast.error("Failed to verify authentication");
        navigate("/auth");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.contact_number) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.organization && !formData.organization_name) {
      toast.error("Please enter your organization name");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await db.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const userData: User = {
        user_id: session.user.id,
        ...formData,
        organization_name: formData.organization ? formData.organization_name : null,
      };

      const { error } = await db.from("users").insert([userData]);

      if (error) {
        toast.error(error.message || "Failed to create profile");
        setLoading(false);
        return;
      }

      toast.success("Profile created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile");
      setLoading(false);
    }
  };

  const handleOrganizationChange = () => {
    if(formData.organization) {
      setFormData({ ...formData, organization:false});
    } else {
      setFormData({ ...formData, organization:true });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Please provide the following information to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    disabled={loading}
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
                    disabled={loading}
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
                  disabled={loading}
                  placeholder="+1234567890"
                />
              </div>

              <div className="flex items-center space-x-2" onClick={() => handleOrganizationChange()}>
              <input type="checkbox" checked={formData.organization} className="mr-2 "/>
              
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
                    onCheckedChange={(e) =>
                      setFormData({
                        ...formData,
                        organization_name: e.target.value,
                      })
                    }
                    required={formData.organization}
                    disabled={loading}
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Profile..." : "Complete Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

