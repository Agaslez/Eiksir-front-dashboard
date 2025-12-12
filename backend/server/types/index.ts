// ELIKSIR + STEFANO - Główne typy TypeScript

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'admin' | 'bartender';
  created_at: Date;
  updated_at: Date;
}

export interface BusinessTemplate {
  id: number;
  name: string; // 'eliksir', 'restaurant', 'spa'
  display_name: string; // 'Mobilny Bar Eliksir'
  category: 'hospitality' | 'food_service' | 'wellness' | 'professional';
  description: string;
  base_price: number; // Cena bazowa w PLN
  features: TemplateFeature[];
  preview_url?: string;
  is_active: boolean;
  created_at: Date;
}

export interface TemplateFeature {
  code: string; // 'reservations', 'ai_menu', 'analytics'
  name: string; // 'System Rezerwacji'
  description: string;
  monthly_price: number; // Cena miesięczna w PLN
  category: 'core' | 'premium' | 'enterprise';
  is_popular: boolean;
  dependencies?: string[]; // Inne features które są wymagane
}

export interface UserBusiness {
  id: number;
  user_id: number;
  template_id: number;
  business_name: string;
  domain: string; // 'eliksir-warszawa' -> eliksir-warszawa.stefano.app
  custom_domain?: string; // www.eliksir-mobile-bar.pl
  selected_features: string[]; // ['basic_website', 'reservations', 'ai_menu']
  monthly_cost: number;
  status: 'active' | 'suspended' | 'cancelled';
  settings: BusinessSettings;
  created_at: Date;
  updated_at: Date;
}

export interface BusinessSettings {
  // Customization
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo_url?: string;
  business_info: {
    description: string;
    address?: string;
    phone: string;
    email: string;
    social_media?: {
      facebook?: string;
      instagram?: string;
      tiktok?: string;
    };
  };
  // ELIKSIR specific
  cocktail_menu?: CocktailMenuItem[];
  pricing_packages?: PricingPackage[];
  gallery_images?: string[];
}

export interface CocktailMenuItem {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  category: 'signature' | 'classic' | 'premium' | 'seasonal' | 'non_alcoholic';
  alcohol_content: 'none' | 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  preparation_time: number; // w minutach
  image_url?: string;
  is_available: boolean;
}

export interface PricingPackage {
  id: string;
  name: string;
  description: string;
  price: number; // Cena za osobę lub za event
  pricing_type: 'per_person' | 'fixed' | 'per_hour';
  includes: string[];
  min_guests?: number;
  max_guests?: number;
  duration_hours?: number;
  is_popular: boolean;
}

export interface EventReservation {
  id: number;
  business_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_date: Date;
  event_type: string; // 'wedding', 'corporate', 'birthday', 'private'
  guest_count: number;
  venue_address: string;
  selected_package?: string;
  selected_cocktails?: string[];
  special_requests?: string;
  estimated_cost: number;
  deposit_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: Date;
  updated_at: Date;
}