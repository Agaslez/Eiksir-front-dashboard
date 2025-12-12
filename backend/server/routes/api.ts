import { Router } from 'express';
import { z } from 'zod';
import { DatabaseService } from '../config/database.js';
import { AIService } from '../services/ai-service.js';

const router = Router();

// Validation schemas
const ReservationSchema = z.object({
  customer_name: z.string().min(2, 'Imię jest wymagane'),
  customer_email: z.string().email('Nieprawidłowy email'),
  customer_phone: z.string().min(9, 'Nieprawidłowy numer telefonu'),
  event_date: z.string().refine(date => !isNaN(Date.parse(date)), 'Nieprawidłowa data'),
  event_type: z.enum(['wedding', 'birthday', 'corporate', 'private', 'other']),
  guest_count: z.number().min(20, 'Minimum 20 gości').max(300, 'Maximum 300 gości'),
  venue_address: z.string().min(10, 'Adres jest wymagany'),
  selected_package: z.string().optional(),
  selected_cocktails: z.array(z.string()).optional(),
  special_requests: z.string().optional()
});

const AIMenuRequestSchema = z.object({
  eventType: z.string(),
  guestCount: z.number().min(20).max(300),
  budget: z.number().min(500),
  preferences: z.array(z.string()).optional(),
  dietary: z.array(z.string()).optional()
});

// ==== BASIC ENDPOINTS ====

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'eliksir-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    message: '🍸 ELIKSIR API działa!',
    timestamp: new Date().toISOString(),
    status: 'connected',
    polishTest: 'Testujemy polskie znaki: ąężćółńśź'
  });
});

// ==== TEMPLATE ENDPOINTS ====

// Get all active templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await DatabaseService.getActiveTemplates();
    res.json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd podczas pobierania szablonów' 
    });
  }
});

// Get specific template by name
router.get('/templates/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const templates = await DatabaseService.getActiveTemplates();
    const template = templates.find(t => t.name === name);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Szablon nie został znaleziony'
      });
    }
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd podczas pobierania szablonu' 
    });
  }
});

// ==== RESERVATION ENDPOINTS ====

// Create new reservation
router.post('/reservations', async (req, res) => {
  try {
    // Fix Polish characters in request body
    const fixedBody = JSON.parse(JSON.stringify(req.body, (key, value) => {
      if (typeof value === 'string') {
        return DatabaseService.fixPolishChars(value);
      }
      return value;
    }));
    
    // Validate request data
    const validatedData = ReservationSchema.parse(fixedBody);
    
    // Calculate estimated cost (simple calculation)
    const basePrice = validatedData.guest_count <= 50 ? 2900 : 
                     validatedData.guest_count <= 80 ? 3900 : 5200;
    const estimated_cost = basePrice + (validatedData.guest_count * 15); // +15 PLN per person
    const deposit_amount = estimated_cost * 0.3; // 30% deposit
    
    // Create reservation
    const reservation = await DatabaseService.createReservation({
      ...validatedData,
      business_id: 1, // Default ELIKSIR business
      event_date: new Date(validatedData.event_date),
      estimated_cost,
      deposit_amount,
      status: 'pending',
      payment_status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      message: 'Rezerwacja została utworzona pomyślnie',
      data: reservation
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Nieprawidłowe dane',
        details: error.errors
      });
    }
    
    console.error('Error creating reservation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd podczas tworzenia rezerwacji' 
    });
  }
});

// ==== AI ENDPOINTS ====

// Generate AI menu
router.post('/ai/menu', async (req, res) => {
  try {
    const validatedData = AIMenuRequestSchema.parse(req.body);
    const aiService = new AIService();
    
    const menu = await aiService.generateCocktailMenu(validatedData);
    
    // Log AI interaction
    await DatabaseService.logAIInteraction({
      business_id: 1,
      interaction_type: 'menu_generation',
      input_data: validatedData,
      output_data: menu,
      tokens_used: 2500, // Estimate
      cost_usd: 0.05 // Estimate
    });
    
    res.json({
      success: true,
      data: menu,
      message: 'Menu AI zostało wygenerowane pomyślnie'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Nieprawidłowe dane',
        details: error.errors
      });
    }
    
    console.error('Error generating AI menu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd podczas generowania menu AI' 
    });
  }
});

// Get business reservations
router.get('/reservations/:businessId', async (req, res) => {
  try {
    const businessId = parseInt(req.params.businessId);
    
    if (isNaN(businessId)) {
      return res.status(400).json({
        success: false,
        error: 'Nieprawidłowe ID biznesu'
      });
    }
    
    const reservations = await DatabaseService.getBusinessReservations(businessId);
    
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
    
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd podczas pobierania rezerwacji' 
    });
  }
});

// Update reservation status
router.patch('/reservations/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Nieprawidłowe ID rezerwacji'
      });
    }
    
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Nieprawidłowy status rezerwacji'
      });
    }
    
    // TODO: Implement update reservation status
    res.json({
      success: true,
      message: `Status rezerwacji został zaktualizowany na: ${status}`
    });
    
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd podczas aktualizacji rezerwacji' 
    });
  }
});

// ==== BUSINESS ENDPOINTS ====

// Get business by domain
router.get('/business/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const business = await DatabaseService.getBusinessByDomain(domain);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Biznes nie został znaleziony'
      });
    }
    
    res.json({
      success: true,
      data: business
    });
    
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd podczas pobierania biznesu' 
    });
  }
});

// Update business settings
router.patch('/business/:id/settings', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const settings = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Nieprawidłowe ID biznesu'
      });
    }
    
    const updatedBusiness = await DatabaseService.updateBusinessSettings(id, settings);
    
    res.json({
      success: true,
      data: updatedBusiness,
      message: 'Ustawienia biznesu zostały zaktualizowane'
    });
    
  } catch (error) {
    console.error('Error updating business settings:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd podczas aktualizacji ustawień biznesu' 
    });
  }
});

// ==== CONTACT ENDPOINTS ====

// Send contact message (simple email)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Wszystkie pola są wymagane'
      });
    }
    
    // Fix Polish characters
    const fixedData = {
      name: DatabaseService.fixPolishChars(name),
      email,
      phone: phone || 'Brak',
      message: DatabaseService.fixPolishChars(message)
    };
    
    // TODO: Send email using email service
    console.log('Contact form submission:', fixedData);
    
    res.json({
      success: true,
      message: 'Wiadomość została wysłana pomyślnie'
    });
    
  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd podczas wysyłania wiadomości' 
    });
  }
});

export default router;