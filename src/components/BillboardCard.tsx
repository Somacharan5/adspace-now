import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Billboard } from "@/lib/data";
import billboard1 from "@/assets/billboard-1.jpg";
import billboard2 from "@/assets/billboard-2.jpg";
import billboard3 from "@/assets/billboard-3.jpg";
import billboard4 from "@/assets/billboard-4.jpg";

const imageMap: Record<string, string> = {
  "billboard-1": billboard1,
  "billboard-2": billboard2,
  "billboard-3": billboard3,
  "billboard-4": billboard4,
};

interface Props {
  billboard: Billboard;
  variant?: "card" | "list";
}

const BillboardCard = ({ billboard, variant = "card" }: Props) => {
  const navigate = useNavigate();
  const img = imageMap[billboard.image] || billboard1;

  if (variant === "list") {
    return (
      <button
        onClick={() => navigate(`/billboard/${billboard.id}`)}
        className="flex gap-3 p-3 rounded-xl bg-card card-shadow w-full text-left animate-fade-in"
      >
        <img src={img} alt={billboard.title} className="w-28 h-20 rounded-lg object-cover flex-shrink-0" />
        <div className="flex flex-col justify-between min-w-0 flex-1">
          <div>
            <h3 className="font-semibold text-sm text-foreground truncate">{billboard.title}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {billboard.city}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">₹{billboard.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/day</span></span>
            <div className="flex gap-1">
              {billboard.tags.slice(0, 1).map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(`/billboard/${billboard.id}`)}
      className="flex-shrink-0 w-64 rounded-xl overflow-hidden bg-card card-shadow animate-fade-in text-left"
    >
      <img src={img} alt={billboard.title} className="w-full h-36 object-cover" />
      <div className="p-3">
        <h3 className="font-semibold text-sm text-foreground truncate">{billboard.title}</h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3" /> {billboard.location}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-foreground">₹{billboard.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/day</span></span>
          <div className="flex gap-1">
            {billboard.tags.slice(0, 1).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
};

export default BillboardCard;
