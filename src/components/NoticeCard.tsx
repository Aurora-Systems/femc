import React, { useState } from "react";
import { MapPin, Calendar, Heart, User } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router-dom";
import db from "../init/db";
import { toast } from "sonner";

interface Notice {
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
  tribute?:number|null;
}

interface NoticeCardProps {
  notice: Notice;
  onTributeUpdate?: () => void;
}

export function NoticeCard({ notice, onTributeUpdate }: NoticeCardProps) {
  const navigate = useNavigate();
  const [tributes, setTributes] = useState(notice.tribute ?? notice.tributes ?? 0);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleViewNotice = () => {
    navigate(`/notice/${notice.id}`);
  };

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      // First, get the current tribute count
      const { data: currentNotice, error: fetchError } = await db
        .from("notices")
        .select("tribute")
        .eq("id", notice.id)
        .single();

      if (fetchError || !currentNotice) {
        console.error("Error fetching current tribute count:", fetchError);
        toast.error("Failed to add tribute");
        setIsUpdating(false);
        return;
      }

      const currentTributeCount = currentNotice.tribute || 0;

      // Increment the tribute count in the notices table
      const new_tribute_count = currentTributeCount + 1;
      const { error, data } = await db
        .from("notices")
        .update({ tribute: new_tribute_count })
        .eq("id", notice.id).single();
        console.log(data)

      if (error) {
        console.error("Error adding tribute:", error);
        toast.error("Failed to add tribute");
      } else {
        // Update local state optimistically
        setTributes(currentTributeCount + 1);
        toast.success("Tribute added");
        
        // Notify parent to refresh if callback provided
        if (onTributeUpdate) {
          onTributeUpdate();
        }
      }
    } catch (error) {
      console.error("Error adding tribute:", error);
      toast.error("Failed to add tribute");
    } finally {
      setIsUpdating(false);
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

  const noticeTypeLabel = getNoticeTypeLabel(notice.noticeType);
  const noticeTypeColor = getNoticeTypeColor(notice.noticeType);

  return (
    <Card className="hover:shadow-lg transition-shadow border-2 border-slate-200 hover:border-[#0f172a] overflow-hidden">
    
      <div className="relative w-full aspect-square bg-slate-200 mb-3">
          {noticeTypeLabel && (
        <div className={`bg-[#0f172a]  text-white px-3 py-2 text-base font-semibold text-center`}>
          {noticeTypeLabel}
        </div>
      )}
        <ImageWithFallback
          src={notice.photoUrl || "https://images.unsplash.com/photo-1759327939527-568eb87f82a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMGZsb3dlcnMlMjBtZW1vcmlhbHxlbnwxfHx8fDE3NjMyMjY1Njd8MA&ixlib=rb-4.1.0&q=80&w=1080"}
          alt={notice.name}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="ps-6 pe-6 pb-6 pt-2">
        <h3 className="text-xl text-[#0f172a] mb-1">
          {notice.name}
        </h3>
        <div className="flex items-start justify-between mb-4">
          <p className="text-slate-600 mb-3">{notice.dates}</p>

          <Badge
            variant="outline"
            className="border-[#0f172a] text-[#0f172a]"
          >
            Age {notice.age}
          </Badge>
        </div>

        <div className=" text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{notice.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{notice.date}</span>
          </div>
        </div>

        <p className="text-slate-700 mb-4 line-clamp-3">
          {notice.description}
        </p>

        <div className="bg-slate-50 rounded p-3 mb-4">
          <p className="text-sm text-slate-700">
            <span className="text-[#0f172a]">Service:</span>{" "}
            {notice.service}
          </p>
        </div>

        <div className="flex items-center justify-between">
          {/* <button
            onClick={handleHeartClick}
            disabled={isUpdating}
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart className={`h-4 w-4 ${isUpdating ? 'animate-pulse' : ''} fill-[#0f172a] text-[#0f172a] hover:fill-rose-600 hover:text-rose-600 transition-colors`} />
            <span>{tributes} tributes</span>
          </button> */}
          <Button
            variant="outline"
            size="sm"
            className="border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white"
            onClick={handleViewNotice}
          >
            View Notice
          </Button>
        </div>
      </div>
    </Card>
  );
}