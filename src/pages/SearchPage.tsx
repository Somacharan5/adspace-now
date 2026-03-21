import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, SlidersHorizontal, Map, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import BillboardCard from "@/components/BillboardCard";
import { billboards } from "@/lib/data";

const filterTags = ["All", "Hoarding", "Digital", "Unipole", "Budget Friendly", "Premium"];

const SearchPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const filtered = billboards.filter((b) => {
    const matchSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "All" || b.type === activeFilter || b.tags.includes(activeFilter);
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search city, area, landmark..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-secondary border-0 text-sm"
              autoFocus
            />
          </div>
          <button
            onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
            className="p-2 rounded-lg bg-secondary"
          >
            {viewMode === "list" ? <Map className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {viewMode === "map" ? (
        <div className="h-64 bg-secondary flex items-center justify-center text-muted-foreground text-sm">
          <div className="text-center">
            <Map className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>Map view coming soon</p>
          </div>
        </div>
      ) : null}

      <div className="px-4 py-4 space-y-3">
        <p className="text-xs text-muted-foreground">{filtered.length} billboards found</p>
        {filtered.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <BillboardCard billboard={b} variant="list" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
