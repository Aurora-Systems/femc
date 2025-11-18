import { Search, Calendar, MapPin, Filter } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select } from "./ui/select";
import { NoticeCard } from "./NoticeCard";

const allNotices = [
  {
    id: 1,
    name: "Margaret Elizabeth Thompson",
    age: 87,
    dates: "1936 - 2024",
    location: "Manchester",
    date: "November 12, 2024",
    description: "Beloved mother, grandmother, and great-grandmother. Passed away peacefully surrounded by family.",
    service: "St. Mary's Church, November 18, 2024 at 2:00 PM",
    tributes: 24
  },
  {
    id: 2,
    name: "James Robert Wilson",
    age: 72,
    dates: "1952 - 2024",
    location: "Birmingham",
    date: "November 10, 2024",
    description: "Loving husband, father, and grandfather. A dedicated teacher who touched countless lives.",
    service: "Birmingham Crematorium, November 17, 2024 at 11:00 AM",
    tributes: 38
  },
  {
    id: 3,
    name: "Sarah Anne Davies",
    age: 65,
    dates: "1959 - 2024",
    location: "Liverpool",
    date: "November 9, 2024",
    description: "Cherished wife and mother. Known for her kindness and compassion to all.",
    service: "Liverpool Cathedral, November 16, 2024 at 3:00 PM",
    tributes: 17
  },
  {
    id: 4,
    name: "Thomas Michael O'Brien",
    age: 91,
    dates: "1933 - 2024",
    location: "Leeds",
    date: "November 8, 2024",
    description: "Devoted family man and veteran. Will be deeply missed by all who knew him.",
    service: "St. Patrick's Church, November 15, 2024 at 10:00 AM",
    tributes: 45
  },
  {
    id: 5,
    name: "Emily Rose Anderson",
    age: 58,
    dates: "1966 - 2024",
    location: "Bristol",
    date: "November 7, 2024",
    description: "Loving mother and devoted nurse. Her caring spirit will live on in our hearts.",
    service: "Bristol Memorial Chapel, November 16, 2024 at 1:00 PM",
    tributes: 31
  },
  {
    id: 6,
    name: "Arthur John Clarke",
    age: 84,
    dates: "1940 - 2024",
    location: "Newcastle",
    date: "November 6, 2024",
    description: "Beloved grandfather and friend to many. A man of integrity and warmth.",
    service: "Newcastle Central Crematorium, November 14, 2024 at 2:30 PM",
    tributes: 22
  },
  {
    id: 7,
    name: "Catherine Mary Hughes",
    age: 76,
    dates: "1948 - 2024",
    location: "Cardiff",
    date: "November 5, 2024",
    description: "Devoted wife and mother. Her warmth and generosity touched everyone she met.",
    service: "Cardiff Memorial Church, November 13, 2024 at 11:30 AM",
    tributes: 29
  },
  {
    id: 8,
    name: "David William Turner",
    age: 69,
    dates: "1955 - 2024",
    location: "Edinburgh",
    date: "November 4, 2024",
    description: "Loving father and successful businessman. His legacy lives on through his family.",
    service: "Edinburgh Central Chapel, November 12, 2024 at 2:00 PM",
    tributes: 41
  },
  {
    id: 9,
    name: "Patricia Jane Morris",
    age: 82,
    dates: "1942 - 2024",
    location: "Glasgow",
    date: "November 3, 2024",
    description: "Cherished grandmother and community volunteer. Known for her endless compassion.",
    service: "Glasgow Cathedral, November 11, 2024 at 10:00 AM",
    tributes: 35
  }
];

export function BrowseNotices() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl text-[#0f172a] mb-2">Browse Funeral Notices</h1>
          <p className="text-slate-600">Search and view all funeral notices</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by name" 
                className="pl-10 border-slate-300"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Location" 
                className="pl-10 border-slate-300"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                type="date" 
                className="pl-10 border-slate-300"
              />
            </div>
            <Button className="bg-[#0f172a] hover:bg-[#1e3a5f]">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="h-4 w-4" />
            <span>Filter by:</span>
            <Button variant="outline" size="sm">Most Recent</Button>
            <Button variant="outline" size="sm">A-Z</Button>
            <Button variant="outline" size="sm">Location</Button>
          </div>
        </div>

        <div className="mb-4 text-sm text-slate-600">
          Showing {allNotices.length} notices
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allNotices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      </div>
    </div>
  );
}
