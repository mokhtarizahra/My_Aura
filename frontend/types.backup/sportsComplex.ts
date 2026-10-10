
// ─── Booking Types ───────────────────────────────────────────────────────────
export type BookingType = "in-person" | "online" | "both";

// ─── Working Hours ───────────────────────────────────────────────────────────
export interface WorkingHours {
  day: DayOfWeek;  // ✅ فقط ID روز (نه کل آبجکت)
  open: string;    // "HH:MM" 24-hour format
  close: string;
  isOff: boolean;
}

// ─── Location ────────────────────────────────────────────────────────────────
export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Address {
  province: string;
  city: string;
  district: string;
  street: string;
  postalCode: string;
  geo?: GeoLocation;
}

// ─── Coach ───────────────────────────────────────────────────────────────────
export interface Coach {
  id: string;
  fullName: string;
  specialty: string;
  bio: string;
  avatarUrl: string;
  coachingCertificate: string;
  experienceYears: number;
  sessionFee: number; // in Toman
  bookingType: BookingType;
  availableDays: DayOfWeek[];  // ✅ فقط آرایه‌ای از IDها
}

// ─── Service ─────────────────────────────────────────────────────────────────
export interface Service {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number; // in Toman
  category: SportsCategory;
}

// ─── Review ──────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  authorName: string;
  avatarUrl?: string;
  rating: number;       // 1-5
  comment: string;
  createdAt: string;    // ISO 8601
  isVerifiedMember: boolean;
}

// ─── Statistics ──────────────────────────────────────────────────────────────
export interface SportsComplexStats {
  totalReviews: number;
  averageRating: number; // 1.0 - 5.0, single decimal
  totalBookings: number;
  responseTimeMinutes: number;
}

// ─── Main Sports Complex ─────────────────────────────────────────────────────
export interface SportsComplex {
  id: string;
  slug: string;
  name: string;
  category: SportsCategory;
  tags: string[];
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  address: Address;
  phone: string;
  website?: string;
  email?: string;
  bookingType: BookingType;
  workingHours: WorkingHours[];
  coaches: Coach[];
  services: Service[];
  reviews: Review[];
  stats: SportsComplexStats;
  minServicePrice: number; 
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: string;
}

// ─── Filters, Pagination, and List Responses ─────────────────────────────────
export interface SportsComplexFilters {
  category?: SportsCategory;
  city?: string;
  bookingType?: BookingType;
  minRating?: number;
  maxPrice?: number;
  isVerified?: boolean;
  searchQuery?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface CategoryDisplay {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  count?: number;
}

// ─── Sports Categories ────────────────────────────────────────────────────────
export type SportsCategory =
  | "football"
  | "futsal"
  | "swimming"
  | "fitness"
  | "basketball"
  | "volleyball"
  | "bodybuilding"
  | "yoga"
  | "pilates"
  | "tennis"
  | "martial-arts";
  
  export type DayOfWeek = 
  | "saturday" 
  | "sunday" 
  | "monday" 
  | "tuesday" 
  | "wednesday" 
  | "thursday" 
  | "friday";