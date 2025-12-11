import React,{ useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { NoticeCard } from "./NoticeCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "./ui/carousel";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import db from "../init/db";
import type { Notice } from "../schemas/noticeSchema";
import type Ad from "../schemas/adSchema";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [filteredNotices, setFilteredNotices] = useState<NoticeCardData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const NOTICES_PER_PAGE = 20;
  const [ads, setAds] = useState<(Ad & { id?: number; photoUrl?: string | null })[]>([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

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

  const getAdPhotoUrl = (photoId: string | null): string | null => {
    if (!photoId) return null;
    try {
      const { data } = db.storage
        .from("ads")
        .getPublicUrl(photoId);
      return data.publicUrl;
    } catch {
      return null;
    }
  };

  const fetchAds = async () => {
    try {
      setAdsLoading(true);
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      
      const { data, error } = await db
        .from("ads")
        .select("*")
        .eq("active", true)
        .eq("status", "approved")
        .gte("expires", today) // Only get ads that haven't expired
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching ads:", error);
        setAds([]);
        return;
      }

      if (!data || data.length === 0) {
        setAds([]);
        return;
      }

      // Transform ads to include photo URLs
      const transformedAds = data.map((ad: Ad & { id?: number }) => ({
        ...ad,
        photoUrl: getAdPhotoUrl(ad.photo_id),
      }));

      setAds(transformedAds);
    } catch (error) {
      console.error("Error fetching ads:", error);
      setAds([]);
    } finally {
      setAdsLoading(false);
    }
  };


  const transformNotice = (notice: Notice & { id?: number; tribute?: number; organization_name?: string | null }, index: number): NoticeCardData => {
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
        notice.maiden_name && `"${notice.maiden_name}"`,
        notice.last_name,
        notice.nickname && `(${notice.nickname})`,
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
      firstName: isCondolence ? null : (notice.first_name || null),
      lastName: isCondolence ? null : (notice.last_name || null),
      middleName: isCondolence ? null : (notice.middle_name || null),
      maidenName: isCondolence ? null : (notice.maiden_name || null),
      nickname: isCondolence ? null : (notice.nickname || null),
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
  };

  const fetchNotices = useCallback(async (searchTerm: string = "", pageNum: number = 0, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      let query = db
        .from("notices")
        .select("*")
        .eq("active", true)
        .order("id", { ascending: false });

      // If there's a search term, filter the database query
      if (searchTerm.trim()) {
        const searchLower = `%${searchTerm.toLowerCase().trim()}%`;
        // Use or() to search across multiple fields with ilike (case-insensitive pattern matching)
        // Include organization_name for condolence notices
        const orConditions = [
          `first_name.ilike.${searchLower}`,
          `last_name.ilike.${searchLower}`,
          `middle_name.ilike.${searchLower}`,
          `maiden_name.ilike.${searchLower}`,
          `nickname.ilike.${searchLower}`,
          `location.ilike.${searchLower}`,
          `obituary.ilike.${searchLower}`,
          `announcement.ilike.${searchLower}`,
          `organization_name.ilike.${searchLower}`
        ].join(',');
        query = query.or(orConditions);
      }

      // Apply pagination
      const from = pageNum * NOTICES_PER_PAGE;
      const to = from + NOTICES_PER_PAGE - 1;
      
      const { data, error } = await query
        .order("event_date", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching notices:", error);
        if (!append) {
          setFilteredNotices([]);
        }
        return;
      }

      if (!data || data.length === 0) {
        if (!append) {
          setFilteredNotices([]);
        }
        setHasMore(false);
        return;
      }

      // Transform notices
      const transformedNotices: NoticeCardData[] = data.map(
        (notice: Notice & { id?: number; tribute?: number }, index: number) => 
          transformNotice(notice, from + index)
      );

      if (append) {
        setFilteredNotices(prev => [...prev, ...transformedNotices]);
      } else {
        setFilteredNotices(transformedNotices);
      }

      // Check if there are more notices to load
      setHasMore(data.length === NOTICES_PER_PAGE);
    } catch (error) {
      console.error("Error fetching notices:", error);
      if (!append) {
        setFilteredNotices([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchNotices("", 0, false);
    fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!carouselApi || ads.length <= 1) return;

    let interval: NodeJS.Timeout;
    let isPaused = false;

    const startAutoplay = () => {
      interval = setInterval(() => {
        if (!isPaused) {
          carouselApi.scrollNext();
        }
      }, 5000); // Change slide every 5 seconds
    };

    startAutoplay();

    // Pause on interaction
    const handleMouseEnter = () => {
      isPaused = true;
    };

    const handleMouseLeave = () => {
      isPaused = false;
    };

    const carouselElement = document.querySelector('[data-slot="carousel"]');
    if (carouselElement) {
      carouselElement.addEventListener('mouseenter', handleMouseEnter);
      carouselElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      clearInterval(interval);
      if (carouselElement) {
        carouselElement.removeEventListener('mouseenter', handleMouseEnter);
        carouselElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [carouselApi, ads.length]);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchNotices(searchQuery, nextPage, true);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, searchQuery, fetchNotices]);

  const handleSearch = () => {
    setPage(0);
    setHasMore(true);
    setFilteredNotices([]);
    fetchNotices(searchQuery, 0, false);
  };

  const handleClear = () => {
    setSearchQuery("");
    setPage(0);
    setHasMore(true);
    setFilteredNotices([]);
    fetchNotices("", 0, false);
  };

  const handleTributeUpdate = useCallback(() => {
    // Refresh the notices to get updated tribute counts
    // Reset to first page when tribute is updated
    setPage(0);
    setHasMore(true);
    fetchNotices(searchQuery, 0, false);
  }, [searchQuery, fetchNotices]);

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

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Ad Section - Shows first on mobile, sidebar on desktop */}
          <div className="w-full lg:w-80 flex-shrink-0 order-1 lg:order-2">
            <div className="lg:sticky lg:top-8">
              {adsLoading ? (
                <div className="w-full h-32 bg-slate-200 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500">Loading ads...</p>
                </div>
              ) : ads.length > 0 ? (
                <Carousel
                  setApi={setCarouselApi}
                  className="w-full"
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                >
                  <CarouselContent className="gap-2">
                    {ads.map((ad, index) => (
                      <CarouselItem key={ad.id || index}>
                        <a
                          // href={ad.link || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full"
                          onClick={() => {
                            // Track click (you might want to increment clicks in the database)
                            if (ad.id) {
                              db.rpc("increment_ad_clicks", { ad_id: ad.id }).then((res) => {
                                console.log(res);
                                navigate(ad.link || "#");
                              })
                              // db.from("ads")
                              //   .update({ clicks: (ad.clicks || 0) + 1 })
                              //   .eq("id", ad.id)
                              //   .then(() => {
                              //     // Optionally refresh ads to update click count
                              //   });
                            }
                          }}
                        >
                          <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden" style={{paddingBottom:"0px !important"}}>
                            <CardContent className="p-0 " >
                              {/* Image on top */}
                              {ad.photoUrl ? (
                                <div className="w-full h-48 overflow-hidden">
                                  <ImageWithFallback
                                    src={ad.photoUrl}
                                    alt={ad.name || "Advertisement"}
                                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
                                  <p className="text-muted-foreground text-sm">No image</p>
                                </div>
                              )}
                              
                              {/* Content below image */}
                              <div className="p-4" style={{paddingBottom:"0px !important"}}>
                                <h3 className="text-lg font-semibold text-[#0f172a] ">{ad.name}</h3>
                                {ad.text && (
                                  <p className="text-sm text-slate-600 line-clamp-3">{ad.text}</p>
                                )}
                                <a href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600">Learn More</a>
                              </div>
                            </CardContent>
                          </Card>
                        </a>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              ) : (
                <div onClick={() => navigate("/dashboard/#ads")} className="w-full h-32 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer">
                  <div className="text-center p-4">
                    <p className="text-lg font-semibold text-[#0f172a] mb-1">Click here to advertise on this space</p>
                    <p className="text-sm text-slate-600">Reach thousands of visitors</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notices Section - Shows second on mobile, main content on desktop */}
          <div className="flex-1 order-2 lg:order-1">
            {isLoading ? (
              <div className="text-center py-12 text-slate-600">
                Loading notices...
              </div>
            ) : filteredNotices.length === 0 ? (
              <div className="text-center py-12 text-slate-600">
                {searchQuery ? "No notices found matching your search." : "No notices available."}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {filteredNotices.map((notice) => (
                    <NoticeCard key={notice.id} notice={notice} onTributeUpdate={handleTributeUpdate} />
                  ))}
                </div>
                {/* Infinite scroll sentinel */}
                <div ref={observerTarget} className="h-10 flex items-center justify-center">
                  {isLoadingMore && (
                    <div className="text-center py-8 text-slate-600">
                      Loading more notices...
                    </div>
                  )}
                  {!hasMore && filteredNotices.length > 0 && (
                    <div className="text-center py-8 text-slate-600">
                      No more notices to load.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}