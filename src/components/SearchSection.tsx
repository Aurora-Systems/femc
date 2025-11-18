import { Search, Calendar, MapPin } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function SearchSection() {
  return (
    <section className="py-8 -mt-8 relative z-10">
      <div className="container mx-auto px-4">
        <Card className="shadow-xl border-[#0f172a] border-2 mt-10">
          <div className="p-6 mt-[10px]">
            <h3 className="text-xl mb-4 text-[#0f172a]">
              Search Funeral Notices
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Name"
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
                  placeholder="Date"
                  className="pl-10 border-slate-300"
                />
              </div>
              <Button className="bg-[#0f172a] hover:bg-[#1e3a5f]">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}