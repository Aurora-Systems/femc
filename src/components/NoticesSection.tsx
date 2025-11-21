import { NoticeCard } from "./NoticeCard";
import { AdSection } from "./AdSection";

const mockNotices = [
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
  }
];

export function NoticesSection() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl text-[#0f172a] mb-2">Recent Notices</h2>
            <p className="text-slate-600">Honoring those who have recently passed</p>
          </div>
          <a href="#" className="text-[#0f172a] hover:underline">View All →</a>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockNotices.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} />
              ))}
            </div>
          </div>
          
          <aside className="lg:w-80 flex-shrink-0">
            <AdSection variant="sidebar" />
          </aside>
        </div>
      </div>
    </section>
  );
}