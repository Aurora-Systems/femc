import React from "react";
import { MapPin, Calendar, Heart, User } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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
}

interface NoticeCardProps {
  notice: Notice;
}

export function NoticeCard({ notice }: NoticeCardProps) {
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
    
      <div className="relative h-48 w-full bg-slate-200 mb-3">
          {noticeTypeLabel && (
        <div className={`bg-[#0f172a]  text-white px-3 py-2 text-base font-semibold text-center`}>
          {noticeTypeLabel}
        </div>
      )}
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1759327939527-568eb87f82a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMGZsb3dlcnMlMjBtZW1vcmlhbHxlbnwxfHx8fDE3NjMyMjY1Njd8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt={notice.name}
          className="w-full h-full object-cover"
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
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <Heart className="h-4 w-4 fill-[#0f172a] text-[#0f172a]" />
            <span>{notice.tributes} tributes</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white"
          >
            View Notice
          </Button>
        </div>
      </div>
    </Card>
  );
}