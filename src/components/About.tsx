import React, { useState, useEffect } from "react";
import {
  Heart,
  Users,
  Shield,
  Award,
  Phone,
  Mail,
  Star,
  TrendingUp,
  Globe,
  Bell,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { NoticeCard } from "./NoticeCard";
import { useNavigate } from "react-router-dom";
import { contactDetails } from "../constants/contactDetails";
import db from "../init/db";
import type { Notice } from "../schemas/noticeSchema";

const values = [
  {
    icon: Heart,
    title: "Compassion",
    description:
      "We understand the difficulty of losing a loved one and approach every interaction with empathy and care.",
    color: "bg-rose-500",
  },
  {
    icon: Shield,
    title: "Integrity",
    description:
      "We maintain the highest standards of honesty and transparency in all our services and communications.",
    color: "bg-blue-500",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We bring people together to celebrate lives, share memories, and support one another during difficult times.",
    color: "bg-purple-500",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "We strive for excellence in every service we provide, ensuring dignity and respect for your loved ones.",
    color: "bg-amber-500",
  },
];

const team = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Founder & CEO",
    description:
      "With over 20 years in bereavement services, Sarah founded Funeral Notices to modernize how we honor and remember loved ones.",
  },
  {
    name: "James O'Connor",
    role: "Head of Client Services",
    description:
      "James leads our compassionate team, ensuring every family receives personalized support during their time of need.",
  },
  {
    name: "Emily Chen",
    role: "Director of Operations",
    description:
      "Emily oversees our nationwide network of funeral directors and service providers, maintaining our high standards.",
  },
];

const stats = [
  { icon: Users, value: "50,000+", label: "Families Served" },
  { icon: Globe, value: "500+", label: "Partner Locations" },
  { icon: Star, value: "4.9/5", label: "Average Rating" },
  {
    icon: TrendingUp,
    value: "19 Years",
    label: "Of Experience",
  },
];

interface NoticeCardData {
  id: number;
  name: string;
  age: number;
  dates: string;
  location: string;
  date: string;
  description: string;
  service: string;
  tributes: number;
  noticeType?: string;
  photoUrl?: string | null;
  tribute?: number | null;
}



export function About() {
  const navigate = useNavigate();
  const [recentNotices, setRecentNotices] = useState<NoticeCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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


  useEffect(() => {
    const fetchRecentNotices = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await db
          .from("notices")
          .select("*")
          .eq("active", true)
          .order("id",{ascending: false})
          .limit(3);

        if (error) {
          console.error("Error fetching notices:", error);
          setRecentNotices([]);
          return;
        }

        if (!data || data.length === 0) {
          setRecentNotices([]);
          return;
        }

        // Transform notices
        const transformedNotices: NoticeCardData[] = data.map((notice: Notice & { id?: number; tribute?: number; organization_name?: string | null }, index: number) => {
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
          const age = isCondolence ? 0 : calculateAge(notice.dob, notice.dop);

          // Format dates (not applicable for condolence notices)
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
          const photoUrl = getPhotoUrl(notice.photo_id);

          // Get tribute count from the notice record
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

        setRecentNotices(transformedNotices);
      } catch (error) {
        console.error("Error fetching notices:", error);
        setRecentNotices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentNotices();
  }, []);

  const handleTributeUpdate = () => {
    // Refresh the recent notices to get updated tribute counts
    const refreshNotices = async () => {
      try {
        const { data, error } = await db
          .from("notices")
          .select("*")
          .order("event_date", { ascending: false })
          .limit(3);

        if (error || !data || data.length === 0) {
          return;
        }

        const transformedNotices: NoticeCardData[] = data.map((notice: Notice & { id?: number; tribute?: number; organization_name?: string | null }, index: number) => {
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
          const age = isCondolence ? 0 : calculateAge(notice.dob, notice.dop);

          // Format dates (not applicable for condolence notices)
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
          const photoUrl = getPhotoUrl(notice.photo_id);

          // Get tribute count from the notice record
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

        setRecentNotices(transformedNotices);
      } catch (error) {
        console.error("Error refreshing notices:", error);
      }
    };
    refreshNotices();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header with Image */}
      <div className="relative header-color overflow-hidden" style={{height:"90vh"}}>
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://funeralnotices.sirv.com/2149431247.jpg"
            alt="Team collaboration"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center text-center">
          <div className="max-w-3xl">
          <img src="https://funeralnotices.sirv.com/femc_logo.png" alt="Funeral Notices Logo"  className="h-16 w-auto mb-4 mx-auto" />
            <h1 className="text-5xl md:text-6xl text-white mb-4">
              Funeral Notices
            </h1>
            <p className="text-xl text-slate-200 mb-4">
              Honoring memories and celebrating lives with
              dignity, respect
            </p>
            <div className="flex gap-4 justify-center">

              <Button onClick={() => navigate("place")}>Place a Notice</Button>
              <Button onClick={() => navigate("browse")} className="bg-white text-[#0f172a] hover:bg-slate-100 shadow-lg">View Notices</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Stats Section */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 -mt-20 relative z-10">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white shadow-xl border-2 border-slate-200">
                <div className="p-6 text-center">
                  <Icon className="h-8 w-8 text-[#0f172a] mx-auto mb-3" />
                  <div className="text-3xl text-[#0f172a] mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              </Card>
            );
          })}
        </div> */}

        {/* Our Story */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl text-[#0f172a] mb-3">
              About
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#0f172a] to-blue-500 mx-auto rounded-full"></div>
          </div>
          <div className=" ">
            <div className="space-y-4 text-slate-700 text-lg leading-relaxed">
              <p>
                Funeral Notices is a digital platform that helps
                families and funeral homes share funeral
                announcements, memorial services, and tombstone
                unveilings in a respectful and accessible way.
                We provide an easy, dignified method to inform
                communities during times of loss.
              </p>
              <p>
               Each notice is
                permanently stored online, creating a lasting
                digital memorial for family and friends.
              </p>
              <p>
                In addition to notices, we offer comprehensive
                funeral management services to simplify planning
                by connecting families with trusted providers
                and coordinating arrangements on one platform.
              </p>
              <p>
                We focus on helping you honor your loved ones
                with dignity while offering the support you need
                during difficult times.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Notices Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-4xl text-[#0f172a] mb-3">
              Recent Notices
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#0f172a] to-blue-500 mx-auto rounded-full"></div>
            <p className="text-slate-600 mt-3">
              Honoring those who have recently passed
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              <div className="col-span-3 text-center py-8 text-slate-600">
                Loading recent notices...
              </div>
            ) : recentNotices.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-slate-600">
                No recent notices available.
              </div>
            ) : (
              recentNotices.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} onTributeUpdate={handleTributeUpdate} />
              ))
            )}
          </div>
          <div className="text-center">
            <Button
              onClick={() => navigate("browse")}
              className="bg-[#0f172a] hover:bg-[#1e3a5f] px-8 py-6 text-lg"
            >
              View More Notices
            </Button>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-4xl text-[#0f172a] mb-3">
              Our Values
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#0f172a] to-blue-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="text-center border-2 border-slate-200 hover:border-[#0f172a] transition-all hover:shadow-xl hover:-translate-y-1 bg-white"
                >
                  <div className="p-6">
                    <div
                      className={`${value.color} text-white rounded-2xl p-5 w-fit mx-auto mb-4 shadow-lg`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl text-[#0f172a] mb-3">
                      {value.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Our Leadership Team */}
        {/* <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-4xl text-[#0f172a] mb-3">
              Our Leadership Team
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#0f172a] to-blue-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <Card
                key={index}
                className="border-2 border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1 bg-white overflow-hidden"
              >
                <div className="h-3 bg-gradient-to-r from-[#0f172a] to-blue-500"></div>
                <div className="p-6">
                  <div className="bg-gradient-to-br from-[#0f172a] to-blue-500 rounded-full h-28 w-28 mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Users className="h-14 w-14 text-white" />
                  </div>
                  <h3 className="text-xl text-[#0f172a] text-center mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-blue-600 text-center mb-4">
                    {member.role}
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div> */}

        {/* Contact CTA */}
        <div className="bg-gradient-to-br from-[#0f172a] via-blue-900 to-[#0f172a] text-white rounded-2xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
          <div className="relative max-w-3xl mx-auto">
            <h2 className="text-4xl mb-4 text-center">
              Get in Touch
            </h2>
            <p className="text-slate-200 text-lg mb-8 text-center">
              We're here to help and answer any questions you
              may have. Contact us and we'll respond as soon as
              possible.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur hover:bg-white/15 transition-all">
                <div className="py-8 text-center">
                  <div className="bg-white/20 rounded-full p-4 w-fit mx-auto mb-4">
                    <Phone className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl mb-2 text-white">
                    Phone Support
                  </h3>
                  <p className="text-slate-200 text-sm mb-4">
                    Available 24/7
                  </p>
                  <Button 
                    className="bg-white text-[#0f172a] hover:bg-slate-100 shadow-lg"
                    onClick={() => navigate("/contact")}
                  >
                    <Phone className="h-4 w-4 " />
                    {contactDetails.phone}
                  </Button>
                </div>
              </Card>
              <Card className="bg-white/10 border-white/20 backdrop-blur hover:bg-white/15 transition-all">
                <div className="py-8 text-center">
                  <div className="bg-white/20 rounded-full p-4 w-fit mx-auto mb-4">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl mb-2 text-white">Email Us</h3>
                  <p className="text-slate-200 text-sm mb-4">
                    We'll respond within 24 hours
                  </p>
                  <Button 
                    className="bg-white text-[#0f172a] hover:bg-slate-100 shadow-lg"
                    onClick={() => navigate("/contact")}
                  >
                    <Mail className="h-4 w-4 " />
                    {contactDetails.email}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}