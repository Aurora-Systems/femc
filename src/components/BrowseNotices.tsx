import React,{ useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { NoticeCard } from "./NoticeCard";
import { AdSection } from "./AdSection";
import db from "../init/db";
import type { Notice } from "../schemas/noticeSchema";

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
}

export function BrowseNotices() {
  const [allNotices, setAllNotices] = useState<NoticeCardData[]>([]);
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

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await db
          .from("notices")
          .select("*")
          .order("event_date", { ascending: false });

        if (error) {
          console.error("Error fetching notices:", error);
          setAllNotices([]);
          setFilteredNotices([]);
          return;
        }

        if (!data || data.length === 0) {
          setAllNotices([]);
          setFilteredNotices([]);
          return;
        }

        const transformedNotices: NoticeCardData[] = data.map((notice: Notice & { id?: number }, index: number) => {
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

          return {
            id: notice.id || index + 1,
            name,
            age: age || 0,
            dates,
            location: notice.location,
            date,
            description,
            service,
            tributes: 0, // Default to 0, can be updated if you have a tributes table
            noticeType: notice.notice_type,
          };
        });

        setAllNotices(transformedNotices);
        setFilteredNotices(transformedNotices);
      } catch (error) {
        console.error("Error fetching notices:", error);
        setAllNotices([]);
        setFilteredNotices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNotices(allNotices);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allNotices.filter((notice) =>
      notice.name.toLowerCase().includes(query) ||
      notice.location.toLowerCase().includes(query) ||
      notice.description.toLowerCase().includes(query)
    );
    setFilteredNotices(filtered);
  }, [searchQuery, allNotices]);

  const handleSearch = () => {
    // Search is handled by useEffect, but we keep this for the button click
    // The search happens automatically as the user types
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl text-[#0f172a] mb-2">Browse Funeral Notices</h1>
          <p className="text-slate-600">Search and view all funeral notices</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by name, location, or description" 
                className="pl-10 border-slate-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button 
              className="bg-[#0f172a] hover:bg-[#1e3a5f]"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
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
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredNotices.slice(0, 6).map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
              
              {filteredNotices.length > 6 && (
                <>
                  <AdSection variant="inline" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {filteredNotices.slice(6).map((notice) => (
                      <NoticeCard key={notice.id} notice={notice} />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <aside className="lg:w-80 flex-shrink-0">
              <AdSection variant="sidebar" />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}