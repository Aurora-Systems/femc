import React,{ useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { NoticeCard } from "./NoticeCard";
import db from "../init/db";
import type { Notice } from "../schemas/noticeSchema";

interface NoticeCardData {
  id: number;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  maidenName?: string | null;
  nickname?: string | null;
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

export function BrowseNotices() {
  const [filteredNotices, setFilteredNotices] = useState<NoticeCardData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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


  const transformNotice = (notice: Notice & { id?: number; tribute?: number }, index: number): NoticeCardData => {
    // Build full name
    const nameParts = [
      notice.first_name,
      notice.middle_name,
      notice.maiden_name,
      notice.last_name
    ].filter(Boolean);
    const name = nameParts.join(" ");

    // Calculate age
    const age = calculateAge(notice.dob, notice.dop);

    // Format dates
    const dates = formatYearRange(notice.dob, notice.dop);
    const date = formatDate(notice.event_date);

    // Get description (obituary for death notices, announcement for others)
    const description = notice.notice_type === "death_notice" 
      ? (notice.obituary || "")
      : (notice.announcement || "");

    // Get service details
    const service = notice.event_details || "Service details to be announced";

    // Get photo URL
    const photoUrl = getPhotoUrl(notice.photo_id);

    // Get tribute count from the notice record
    const tributeCount = notice.tribute || 0;

    return {
      id: notice.id || index + 1,
      name,
      firstName: notice.first_name || null,
      lastName: notice.last_name || null,
      middleName: notice.middle_name || null,
      maidenName: notice.maiden_name || null,
      nickname: notice.nickname || null,
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
  };

  const fetchNotices = async (searchTerm: string = "") => {
    try {
      setIsLoading(true);
      let query = db
        .from("notices")
        .select("*").eq("active", true).order("id",{ascending: false});

      // If there's a search term, filter the database query
      if (searchTerm.trim()) {
        const searchLower = `%${searchTerm.toLowerCase().trim()}%`;
        // Use or() to search across multiple fields with ilike (case-insensitive pattern matching)
        const orConditions = [
          `first_name.ilike.${searchLower}`,
          `last_name.ilike.${searchLower}`,
          `middle_name.ilike.${searchLower}`,
          `maiden_name.ilike.${searchLower}`,
          `nickname.ilike.${searchLower}`,
          `location.ilike.${searchLower}`,
          `obituary.ilike.${searchLower}`,
          `announcement.ilike.${searchLower}`
        ].join(',');
        query = query.or(orConditions);
      }

      const { data, error } = await query.order("event_date", { ascending: false });

      if (error) {
        console.error("Error fetching notices:", error);
        setFilteredNotices([]);
        return;
      }

      if (!data || data.length === 0) {
        setFilteredNotices([]);
        return;
      }

      // Transform notices
      const transformedNotices: NoticeCardData[] = data.map(
        (notice: Notice & { id?: number; tribute?: number }, index: number) => 
          transformNotice(notice, index)
      );

      setFilteredNotices(transformedNotices);
    } catch (error) {
      console.error("Error fetching notices:", error);
      setFilteredNotices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSearch = () => {
    fetchNotices(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery("");
    fetchNotices();
  };

  const handleTributeUpdate = () => {
    // Refresh the notices to get updated tribute counts
    fetchNotices(searchQuery);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-[#0f172a] mb-2">Browse Funeral Notices</h1>
          <p className="text-sm sm:text-base text-slate-600">Search and view all funeral notices</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative w-full min-w-0">
              <Input 
                placeholder="Search by name, location, or description" 
                className="border-slate-300 w-full text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <div className="flex gap-2 sm:gap-3  sm:w-auto sm:flex-shrink-0">
              <Button 
                className="bg-[#0f172a] hover:bg-[#1e3a5f] flex-1 sm:flex-initial sm:px-4 sm:min-w-[100px]"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
              {searchQuery && (
                <Button 
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-100 flex-1 sm:flex-initial sm:px-4 sm:min-w-[80px]"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4 text-sm text-slate-600">
          {isLoading ? (
            "Loading notices..."
          ) : (
            `Showing ${filteredNotices.length} ${filteredNotices.length === 1 ? 'notice' : 'notices'}`
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-600">
            Loading notices...
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            {searchQuery ? "No notices found matching your search." : "No notices available."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredNotices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} onTributeUpdate={handleTributeUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}