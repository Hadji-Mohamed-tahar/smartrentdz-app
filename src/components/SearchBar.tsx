import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { wilayas } from "@/data/wilayas";

interface SearchBarProps {
  variant?: "hero" | "compact";
}

const SearchBar = ({ variant = "compact" }: SearchBarProps) => {
  const navigate = useNavigate();
  const [wilaya, setWilaya] = useState("");
  const [priceUnit, setPriceUnit] = useState("");
  const [rooms, setRooms] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (wilaya) params.set("wilaya", wilaya);
    if (priceUnit) params.set("priceUnit", priceUnit);
    if (rooms) params.set("rooms", rooms);
    navigate(`/search?${params.toString()}`);
  };

  if (variant === "hero") {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-card rounded-2xl shadow-xl p-4 md:p-6 border">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Wilaya Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                الولاية
              </label>
              <Select value={wilaya} onValueChange={setWilaya}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="اختر الولاية" />
                </SelectTrigger>
                <SelectContent>
                  {wilayas.map((w) => (
                    <SelectItem key={w.id} value={w.id.toString()}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                مدة الكراء
              </label>
              <Select value={priceUnit} onValueChange={setPriceUnit}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="اختر المدة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">يومي</SelectItem>
                  <SelectItem value="week">أسبوعي</SelectItem>
                  <SelectItem value="month">شهري</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rooms Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                عدد الغرف
              </label>
              <Select value={rooms} onValueChange={setRooms}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="الغرف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">غرفة واحدة</SelectItem>
                  <SelectItem value="2">غرفتان</SelectItem>
                  <SelectItem value="3">3 غرف</SelectItem>
                  <SelectItem value="4">4+ غرف</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button
                size="lg"
                className="w-full h-12 bg-gradient-hero hover:opacity-90 transition-opacity"
                onClick={handleSearch}
              >
                <Search className="h-5 w-5 ml-2" />
                ابحث الآن
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant
  return (
    <div className="flex gap-2 w-full max-w-2xl">
      <Select value={wilaya} onValueChange={setWilaya}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="الولاية" />
        </SelectTrigger>
        <SelectContent>
          {wilayas.map((w) => (
            <SelectItem key={w.id} value={w.id.toString()}>
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleSearch}>
        <Search className="h-4 w-4 ml-2" />
        بحث
      </Button>
    </div>
  );
};

export default SearchBar;
