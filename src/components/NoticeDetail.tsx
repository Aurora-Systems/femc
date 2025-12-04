import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import db from "../init/db";
import type { Notice } from "../schemas/noticeSchema";

export function NoticeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<(Notice & { id?: number }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

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

  const getNoticeTypeLabel = (type?: string): string => {
    if (!type) return "";
    switch (type) {
      case "death_notice":
        return "Death Notice";
      case "memorial_service":
        return "Memorial Service";
      case "tombstone_unveiling":
        return "Tombstone Unveiling";
      default:
        return type;
    }
  };

  const getNoticeTypeColor = (type?: string): string => {
    if (!type) return "bg-slate-900";
    switch (type) {
      case "death_notice":
        return "bg-slate-900";
      case "memorial_service":
        return "bg-blue-900";
      case "tombstone_unveiling":
        return "bg-purple-900";
      default:
        return "bg-slate-900";
    }
  };

  const getPlaceholderImage = (type?: string): string => {
    switch (type) {
      case "death_notice":
        return "https://funeralnotices.sirv.com/1.png";
      case "memorial_service":
        return "https://funeralnotices.sirv.com/3.png";
      case "tombstone_unveiling":
        return "https://funeralnotices.sirv.com/2.png";
      default:
        return "https://funeralnotices.sirv.com/1.png";
    }
  };

  useEffect(() => {
    const fetchNotice = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await db
          .from("notices")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching notice:", error);
          setNotice(null);
          return;
        }

        if (data) {
          setNotice(data);

          // Get photo URL if photo_id exists
          if (data.photo_id) {
            try {
              const { data: urlData } = db.storage
                .from("notices")
                .getPublicUrl(data.photo_id);
              setPhotoUrl(urlData.publicUrl);
            } catch (error) {
              console.error("Error getting photo URL:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching notice:", error);
        setNotice(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-slate-600">Loading notice details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h2 className="text-2xl text-[#0f172a] mb-4">Notice Not Found</h2>
            <p className="text-slate-600 mb-6">The notice you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/browse")} className="bg-[#0f172a] hover:bg-[#1e3a5f]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Build full name
  const nameParts = [
    notice.first_name,
    notice.middle_name,
    notice.maiden_name,
    notice.last_name
  ].filter(Boolean);
  const name = nameParts.join(" ");

  const age = calculateAge(notice.dob, notice.dop);
  const dates = formatYearRange(notice.dob, notice.dop);
  const eventDate = formatDate(notice.event_date);
  const noticeTypeLabel = getNoticeTypeLabel(notice.notice_type);
  const noticeTypeColor = getNoticeTypeColor(notice.notice_type);

  const description = notice.notice_type === "death_notice" 
    ? (notice.obituary || "")
    : (notice.announcement || "");

  const imageSrc = photoUrl || getPlaceholderImage(notice.notice_type);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          onClick={() => navigate("/browse")}
          variant="ghost"
          className="mb-6 text-slate-600 hover:text-[#0f172a]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Browse
        </Button>

        <Card className="shadow-lg border-2 border-slate-200 overflow-hidden gap-0">
          {noticeTypeLabel && (
            <div className={`bg-[#0f172a] text-white px-4 py-2 text-center`}>
              <p className="text-sm font-semibold">{noticeTypeLabel}</p>
            </div>
          )}

          {/* Grid Layout: Image and Text Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="bg-slate-200">
              <div className="relative w-full h-full min-h-[400px] md:min-h-[600px]">
                <ImageWithFallback
                  src={imageSrc}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Text Content Section */}
            <div className="p-6 flex flex-col">
              <h1 className="text-2xl text-[#0f172a] mb-3 font-semibold">{name}</h1>

              <div className="flex items-start justify-between mb-4">
                <div>
                  {dates && (
                    <p className="text-base text-slate-600 mb-2">{dates}</p>
                  )}
                  {age !== null && (
                    <Badge
                      variant="outline"
                      className="border-[#0f172a] text-[#0f172a] text-sm px-2 py-0.5"
                    >
                      Age {age}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4 text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{notice.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{eventDate}</span>
                </div>
              </div>

              {description && (
                <div className="mb-4">
                  <h2 className="text-lg text-[#0f172a] mb-2 font-semibold">
                    {notice.notice_type === "death_notice" ? "Obituary / Tribute" : "Announcement Details"}
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {description}
                  </p>
                </div>
              )}

              {notice.event_details && (
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <h2 className="text-lg text-[#0f172a] mb-2 font-semibold">
                    {notice.notice_type === "death_notice" ? "Funeral Service Details" : "Event Details"}
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {notice.event_details}
                  </p>
                </div>
              )}

              {notice.relationship && (
                <div className="text-xs text-slate-600 mb-4">
                  <span className="font-semibold">Posted by: </span>
                  {notice.relationship}
                </div>
              )}

              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-200">
                <Heart className="h-4 w-4 fill-[#0f172a] text-[#0f172a]" />
                <span className="text-sm text-slate-600">0 tributes</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

