import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { Mail, Shield } from "lucide-react";
import db from "../init/db";
import { toast } from "sonner";

export default function AuthenticationPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await db.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // This allows both signup and signin
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success("OTP sent to your email!");
      setStep("otp");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    

    setLoading(true);
    try {
      const { data, error } = await db.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check if user profile exists in database
        const { data: profile, error: profileError } = await db
          .from("users")
          .select("*")
          .eq("user_id", data.user.id)
          .single();

        if (profileError || !profile) {
          // User doesn't have a profile, redirect to onboard
          navigate("/onboard");
        } else {
          // User has a profile, redirect to dashboard
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify OTP");
      setLoading(false);
    }
  };

  const handleBackToEmail = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setLoading(false);
    setStep("email");
    setOtp("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-4">
      <Card className="  shadow-2xl border-0 bg-white/95 backdrop-blur-sm card-auth" >
        <CardHeader className="space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              {step === "email" ? (
                <Mail className="h-6 w-6 text-primary" />
              ) : (
                <Shield className="h-6 w-6 text-primary" />
              )}
            </div>
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">
              {step === "email" ? "Welcome" : "Verify Code"}
            </CardTitle>
            <CardDescription className="">
              {step === "email"
                ? "Enter your email to continue"
                : "Enter the otp code sent to your email"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {step === "email" ? (
            <form key="email-form" onSubmit={handleSendOTP} className="space-y-5">
              <div className="space-y-2 text-center">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 text-base w-full"
                />
              </div>
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium" 
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium text-center block">
                    Verification Code
                  </Label>
                  <div className="flex justify-center py-2">
                    <Input
                    className="text-center"
                    type="text"
                      value={otp}
                      onChange={(e:any) => setOtp(e.target.value)}
                      disabled={loading}
                    />
                     
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Code sent to <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToEmail}
                  disabled={loading}
                  className="flex-1 h-11"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 font-medium"
                  disabled={loading }
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

