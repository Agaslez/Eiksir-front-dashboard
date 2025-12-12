import { neon } from '@neondatabase/serverless';
import { desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar
} from 'drizzle-orm/pg-core';

// Database connection
const sql = neon(process.env.DATABASE_URL || '');
export const db = drizzle(sql);

// Schema definitions
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  role: varchar('role', { length: 50 }).notNull().default('customer'),
  password_hash: text('password_hash'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const business_templates = pgTable('business_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(), // 'eliksir'
  display_name: varchar('display_name', { length: 200 }).notNull(), // 'Mobilny Bar Eliksir'
  category: varchar('category', { length: 50 }).notNull(),
  description: text('description').notNull(),
  base_price: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  features: jsonb('features').notNull(), // TemplateFeature[]
  preview_url: varchar('preview_url', { length: 500 }),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const user_businesses = pgTable('user_businesses', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  template_id: integer('template_id').notNull().references(() => business_templates.id),
  business_name: varchar('business_name', { length: 200 }).notNull(),
  domain: varchar('domain', { length: 100 }).notNull().unique(),
  custom_domain: varchar('custom_domain', { length: 200 }),
  selected_features: jsonb('selected_features').notNull(), // string[]
  monthly_cost: decimal('monthly_cost', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  settings: jsonb('settings').notNull(), // BusinessSettings
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const reservations = pgTable('reservations', {
  id: serial('id').primaryKey(),
  business_id: integer('business_id').notNull().references(() => user_businesses.id),
  customer_name: varchar('customer_name', { length: 255 }).notNull(),
  customer_email: varchar('customer_email', { length: 255 }).notNull(),
  customer_phone: varchar('customer_phone', { length: 20 }).notNull(),
  event_date: timestamp('event_date').notNull(),
  event_type: varchar('event_type', { length: 100 }).notNull(),
  guest_count: integer('guest_count').notNull(),
  venue_address: text('venue_address').notNull(),
  selected_package: varchar('selected_package', { length: 100 }),
  selected_cocktails: jsonb('selected_cocktails'), // string[]
  special_requests: text('special_requests'),
  estimated_cost: decimal('estimated_cost', { precision: 10, scale: 2 }).notNull(),
  deposit_amount: decimal('deposit_amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  payment_status: varchar('payment_status', { length: 20 }).notNull().default('pending'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const ai_interactions = pgTable('ai_interactions', {
  id: serial('id').primaryKey(),
  business_id: integer('business_id').references(() => user_businesses.id),
  interaction_type: varchar('interaction_type', { length: 100 }).notNull(), // 'menu_generation', 'feedback_analysis'
  input_data: jsonb('input_data').notNull(),
  output_data: jsonb('output_data').notNull(),
  tokens_used: integer('tokens_used'),
  cost_usd: decimal('cost_usd', { precision: 8, scale: 4 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Database Service - Helper functions
export class DatabaseService {
  static async getBusinessByDomain(domain: string) {
    const result = await db
      .select()
      .from(user_businesses)
      .where(eq(user_businesses.domain, domain))
      .limit(1);
    
    return result[0] || null;
  }

  static async getUserBusinesses(userId: number) {
    return await db
      .select()
      .from(user_businesses)
      .where(eq(user_businesses.user_id, userId));
  }

  static async getActiveTemplates() {
    return await db
      .select()
      .from(business_templates)
      .where(eq(business_templates.is_active, true));
  }

  static async createReservation(reservationData: any) {
    const result = await db
      .insert(reservations)
      .values(reservationData)
      .returning();
    
    return result[0];
  }

  static async updateBusinessSettings(businessId: number, settings: any) {
    const result = await db
      .update(user_businesses)
      .set({ 
        settings,
        updated_at: new Date()
      })
      .where(eq(user_businesses.id, businessId))
      .returning();
    
    return result[0];
  }

  static async logAIInteraction(interactionData: any) {
    return await db
      .insert(ai_interactions)
      .values(interactionData)
      .returning();
  }

  static async getBusinessReservations(businessId: number) {
    return await db
      .select()
      .from(reservations)
      .where(eq(reservations.business_id, businessId))
      .orderBy(desc(reservations.event_date));
  }

  // Polskie znaki - helper do fixowania encodingu
  static fixPolishChars(text: string): string {
    const fixes: { [key: string]: string } = {
      'Ã¡': 'ą', 'Ã©': 'ę', 'Ã³': 'ó', 'Å›': 'ś', 'Å‚': 'ł',
      'Åº': 'ź', 'Å¼': 'ż', 'Ä™': 'ę', 'Ä…': 'ą', 'Å„': 'ń',
      'Ä‡': 'ć', 'Ä™': 'ę', 'ÄŚ': 'Ć', 'Ĺ': 'Ł', 'Ĺš': 'Ś',
      'ÄĄ': 'Ą', 'Ě': 'Ń', 'Ĺ»': 'Ź', 'ĹĽ': 'Ż'
    };
    
    let fixed = text;
    Object.keys(fixes).forEach(key => {
      fixed = fixed.replace(new RegExp(key, 'g'), fixes[key]);
    });
    
    return fixed;
  }
}

// ELIKSIR Default Template Data
export const ELIKSIR_TEMPLATE_SEED = {
  name: 'eliksir',
  display_name: 'Mobilny Bar Eliksir',
  category: 'hospitality',
  description: 'Profesjonalny mobilny bar koktajlowy dla eventów i imprez',
  base_price: 29.00,
  features: [
    {
      code: 'basic_website',
      name: 'Strona internetowa',
      description: 'Elegancka strona z galerią i kontaktem',
      monthly_price: 0,
      category: 'core',
      is_popular: false,
      dependencies: []
    },
    {
      code: 'contact_form',
      name: 'Formularz kontaktowy',
      description: 'System przyjmowania zapytań od klientów',
      monthly_price: 0,
      category: 'core',
      is_popular: false,
      dependencies: ['basic_website']
    },
    {
      code: 'reservation_system',
      name: 'System rezerwacji',
      description: 'Zaawansowany kalendarz i zarządzanie rezerwacjami',
      monthly_price: 30,
      category: 'premium',
      is_popular: true,
      dependencies: ['basic_website', 'contact_form']
    },
    {
      code: 'price_calculator',
      name: 'Kalkulator wyceny',
      description: 'Automatyczne wyliczanie kosztów na podstawie parametrów',
      monthly_price: 20,
      category: 'premium',
      is_popular: true,
      dependencies: ['basic_website']
    },
    {
      code: 'ai_menu_generator',
      name: 'AI Generator Menu',
      description: 'Inteligentne tworzenie menu koktajli z użyciem AI',
      monthly_price: 40,
      category: 'enterprise',
      is_popular: false,
      dependencies: ['basic_website']
    },
    {
      code: 'analytics_dashboard',
      name: 'Panel analityczny',
      description: 'Statystyki i raporty biznesowe',
      monthly_price: 25,
      category: 'premium',
      is_popular: false,
      dependencies: ['basic_website']
    },
    {
      code: 'sms_notifications',
      name: 'Powiadomienia SMS',
      description: 'Automatyczne SMS-y do klientów',
      monthly_price: 15,
      category: 'premium',
      is_popular: false,
      dependencies: ['reservation_system']
    }
  ],
  preview_url: 'https://eliksir-demo.stefano.app',
  is_active: true
};

// Seed functions
export async function seedEliksirTemplate() {
  try {
    const existing = await db
      .select()
      .from(business_templates)
      .where(eq(business_templates.name, 'eliksir'))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(business_templates).values(ELIKSIR_TEMPLATE_SEED);
      console.log('✅ ELIKSIR template seeded successfully');
    } else {
      console.log('📋 ELIKSIR template already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding ELIKSIR template:', error);
  }
}

// Database initialization
export async function initializeDatabase() {
  try {
    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Database connected successfully');
    
    // Seed templates
    await seedEliksirTemplate();
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

// UTF-8 Configuration dla PostgreSQL
export const UTF8_CONFIG = {
  client_encoding: 'UTF8',
  timezone: 'Europe/Warsaw',
  locale: 'pl_PL.UTF-8'
};