import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import db from "../init/db";
import { User } from "../schemas/userSchema";
import { toast } from "sonner";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

