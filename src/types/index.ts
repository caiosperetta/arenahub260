export type UserRole = 'super_admin' | 'admin' | 'staff' | 'client';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'rejected';

export type TenantPlan = 'basico' | 'profissional' | 'enterprise';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  plan: TenantPlan;
  active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string | null;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Court {
  id: string;
  tenant_id: string;
  name: string;
  sport_type: string;
  price_per_hour: number;
  active: boolean;
  photo_url?: string;
  created_at: string;
}

export interface OpeningHours {
  id: string;
  tenant_id: string;
  weekday: number; // 0=Dom, 1=Seg, ... 6=Sáb
  open_time: string; // "08:00:00"
  close_time: string; // "22:00:00"
  is_open: boolean;
  created_at: string;
}

export interface CourtSlot {
  id: string;
  court_id: string;
  tenant_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  active: boolean;
}

export interface Booking {
  id: string;
  tenant_id: string;
  court_id: string;
  client_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string | null;
  price: number;
  created_at: string;
}

export interface MonthlyPlan {
  id: string;
  tenant_id: string;
  client_id: string;
  court_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  price_per_month: number;
  active: boolean;
  created_at: string;
}

export interface BookingWithRelations extends Booking {
  client_full_name: string;
  client_phone: string | null;
  client_avatar_url?: string | null;
  court_name: string;
  court_sport_type?: string;
  court_price_per_hour?: number;
}

export interface ClientWithStats extends Profile {
  total_bookings: number;
  last_booking_date: string | null;
  is_monthly: boolean;
}

export interface BookingWithCourt extends Booking {
  court_name: string;
  court_sport_type?: string;
}

export interface MonthlyPlanWithCourt extends MonthlyPlan {
  court_name: string;
  court_sport_type?: string;
}

export interface CourtOccupancy {
  court_id: string;
  court_name: string;
  bookings_count: number;
}

export interface DashboardMetrics {
  revenueToday: number;
  totalBookingsToday: number;
  pendingBookings: number;
  occupancyPct: number;
  activeClients: number;
}

export type FinanceiroPeriod = 'hoje' | '7dias' | '30dias' | '3meses';

export interface FinanceiroMetrics {
  confirmedRevenue: number;
  pendingRevenue: number;
  totalBookings: number;
  averageTicket: number;
}
