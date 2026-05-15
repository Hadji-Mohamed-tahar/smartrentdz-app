import apartment1 from "@/assets/apartment-1.jpg";
import apartment2 from "@/assets/apartment-2.jpg";
import apartment3 from "@/assets/apartment-3.jpg";
import apartment4 from "@/assets/apartment-4.jpg";

export interface Apartment {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  priceUnit: "day" | "week" | "month";
  wilaya: string;
  wilayaId: number;
  municipality: string;
  rooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  isFeatured: boolean;
  isActive: boolean;
  views: number;
  phoneClicks: number;
  createdAt: string;
  landlordId: string;
  landlordPhone: string;
  landlordName: string;
}

// بيانات وهمية للعرض
export const mockApartments: Apartment[] = [
  {
    id: "1",
    title: "شقة فاخرة بإطلالة بحرية",
    description: "شقة مفروشة بالكامل في قلب العاصمة، تتميز بإطلالة رائعة على البحر وتجهيزات عصرية. مثالية للإقامة القصيرة أو الطويلة.",
    images: [apartment3, apartment1],
    price: 8000,
    priceUnit: "day",
    wilaya: "الجزائر",
    wilayaId: 16,
    municipality: "باب الوادي",
    rooms: 3,
    bathrooms: 2,
    area: 120,
    amenities: ["واي فاي", "تكييف", "موقف سيارات", "مطبخ مجهز", "غسالة"],
    isFeatured: true,
    isActive: true,
    views: 245,
    phoneClicks: 32,
    createdAt: "2024-01-15",
    landlordId: "l1",
    landlordPhone: "0555123456",
    landlordName: "محمد بن علي",
  },
  {
    id: "2",
    title: "استوديو عصري وسط المدينة",
    description: "استوديو مريح ومجهز بالكامل، قريب من جميع المرافق والخدمات. مناسب للأفراد أو الأزواج.",
    images: [apartment2, apartment4],
    price: 25000,
    priceUnit: "week",
    wilaya: "وهران",
    wilayaId: 31,
    municipality: "وهران",
    rooms: 1,
    bathrooms: 1,
    area: 45,
    amenities: ["واي فاي", "تكييف", "مطبخ صغير"],
    isFeatured: false,
    isActive: true,
    views: 128,
    phoneClicks: 15,
    createdAt: "2024-01-20",
    landlordId: "l2",
    landlordPhone: "0661234567",
    landlordName: "أحمد الوهراني",
  },
  {
    id: "3",
    title: "شقة عائلية واسعة",
    description: "شقة واسعة مناسبة للعائلات الكبيرة، تتوفر على جميع التجهيزات اللازمة لإقامة مريحة.",
    images: [apartment4, apartment3],
    price: 45000,
    priceUnit: "month",
    wilaya: "قسنطينة",
    wilayaId: 25,
    municipality: "قسنطينة",
    rooms: 4,
    bathrooms: 2,
    area: 150,
    amenities: ["واي فاي", "تكييف", "موقف سيارات", "مطبخ مجهز", "غسالة", "شرفة"],
    isFeatured: true,
    isActive: true,
    views: 189,
    phoneClicks: 24,
    createdAt: "2024-01-10",
    landlordId: "l3",
    landlordPhone: "0771234567",
    landlordName: "كريم القسنطيني",
  },
  {
    id: "4",
    title: "شقة مطلة على جبال الأطلس",
    description: "شقة هادئة في منطقة جبلية ساحرة، مثالية للباحثين عن الهدوء والطبيعة الخلابة.",
    images: [apartment1, apartment2],
    price: 5000,
    priceUnit: "day",
    wilaya: "تيزي وزو",
    wilayaId: 15,
    municipality: "تيزي وزو",
    rooms: 2,
    bathrooms: 1,
    area: 80,
    amenities: ["واي فاي", "تدفئة", "مطبخ مجهز", "إطلالة جبلية"],
    isFeatured: false,
    isActive: true,
    views: 92,
    phoneClicks: 11,
    createdAt: "2024-01-25",
    landlordId: "l4",
    landlordPhone: "0551234567",
    landlordName: "سعيد أمزيان",
  },
  {
    id: "5",
    title: "شقة فاخرة قرب البحر",
    description: "شقة راقية على بعد دقائق من الشاطئ، مثالية للعطلات الصيفية والاستجمام.",
    images: [apartment3, apartment1],
    price: 12000,
    priceUnit: "day",
    wilaya: "عنابة",
    wilayaId: 23,
    municipality: "عنابة",
    rooms: 3,
    bathrooms: 2,
    area: 110,
    amenities: ["واي فاي", "تكييف", "موقف سيارات", "قريب من البحر"],
    isFeatured: true,
    isActive: true,
    views: 312,
    phoneClicks: 45,
    createdAt: "2024-01-05",
    landlordId: "l5",
    landlordPhone: "0661234568",
    landlordName: "ياسين العنابي",
  },
  {
    id: "6",
    title: "شقة اقتصادية للطلاب",
    description: "شقة بسيطة ومريحة قريبة من الجامعة، مناسبة للطلاب والموظفين.",
    images: [apartment2, apartment4],
    price: 20000,
    priceUnit: "month",
    wilaya: "سطيف",
    wilayaId: 19,
    municipality: "سطيف",
    rooms: 2,
    bathrooms: 1,
    area: 60,
    amenities: ["واي فاي", "تدفئة", "مطبخ صغير"],
    isFeatured: false,
    isActive: true,
    views: 156,
    phoneClicks: 19,
    createdAt: "2024-01-18",
    landlordId: "l6",
    landlordPhone: "0771234568",
    landlordName: "عمر السطيفي",
  },
];

export const getPriceUnitLabel = (unit: Apartment["priceUnit"]) => {
  switch (unit) {
    case "day":
      return "يوم";
    case "week":
      return "أسبوع";
    case "month":
      return "شهر";
    default:
      return "";
  }
};
