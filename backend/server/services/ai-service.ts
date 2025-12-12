import Anthropic from '@anthropic-ai/sdk';

interface AIServiceConfig {
  anthropicApiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export class AIService {
  private anthropic: Anthropic;
  private config: AIServiceConfig;

  constructor() {
    this.config = {
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
      model: 'claude-3-5-sonnet-20241022', // Najnowszy model
      maxTokens: 4000,
      temperature: 0.7
    };

    if (!this.config.anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }

    this.anthropic = new Anthropic({
      apiKey: this.config.anthropicApiKey,
    });
  }

  /**
   * Generuje spersonalizowane menu koktajli dla ELIKSIR
   */
  async generateCocktailMenu(eventDetails: {
    eventType: string;
    guestCount: number;
    budget: number;
    preferences?: string[];
    dietary?: string[];
  }) {
    const prompt = `
    Jesteś ekspertem barmana dla ELIKSIR - mobilnego baru koktajlowego. 
    
    Stwórz spersonalizowane menu koktajli dla wydarzenia:
    - Typ: ${eventDetails.eventType}
    - Liczba gości: ${eventDetails.guestCount}
    - Budżet: ${eventDetails.budget} PLN
    - Preferencje: ${eventDetails.preferences?.join(', ') || 'brak'}
    - Diety specjalne: ${eventDetails.dietary?.join(', ') || 'brak'}
    
    Zwróć JSON z następującą strukturą:
    {
      "signature_cocktails": [
        {
          "name": "nazwa koktajlu",
          "description": "opis",
          "ingredients": ["składnik1", "składnik2"],
          "price": 35,
          "category": "premium|classic|seasonal",
          "difficulty": "easy|medium|hard",
          "alcohol_content": "low|medium|high|none"
        }
      ],
      "recommended_packages": [
        {
          "name": "Pakiet nazwa",
          "description": "opis pakietu",
          "cocktails_included": 5,
          "price_per_person": 45,
          "ideal_for": "typ wydarzenia"
        }
      ],
      "bartender_notes": "profesjonalne wskazówki",
      "estimated_total": 1500
    }
    
    WAŻNE: 
    - Wszystkie ceny w PLN
    - Menu musi być dopasowane do polskiego rynku
    - Uwzględnij sezonowość i trendy
    - Zachowaj elegancki, premium charakter marki ELIKSIR
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return JSON.parse(content.text);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate cocktail menu');
    }
  }

  /**
   * Generuje content marketingowy dla social media
   */
  async generateSocialContent(eventData: {
    eventType: string;
    cocktails: string[];
    venue: string;
    date: string;
  }) {
    const prompt = `
    Stwórz posty na social media dla ELIKSIR - mobilnego baru koktajlowego.
    
    Szczegóły wydarzenia:
    - Typ: ${eventData.eventType}
    - Koktajle: ${eventData.cocktails.join(', ')}
    - Miejsce: ${eventData.venue}
    - Data: ${eventData.date}
    
    Zwróć JSON:
    {
      "instagram_post": {
        "caption": "tekst posta z hashtagami",
        "story_ideas": ["idea1", "idea2", "idea3"]
      },
      "facebook_post": {
        "title": "tytuł",
        "description": "opis wydarzenia",
        "cta": "call to action"
      },
      "hashtags": ["#eliksir", "#mobilnybar", "..."],
      "content_pillars": ["jakość", "elegancja", "..."]
    }
    
    Styl: elegancki, premium, profesjonalny ale przystępny
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: 2000,
        temperature: 0.8,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return JSON.parse(content.text);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('AI Social Content Error:', error);
      throw new Error('Failed to generate social content');
    }
  }

  /**
   * Analizuje feedback klienta i sugeruje ulepszenia
   */
  async analyzeFeedback(feedback: {
    rating: number;
    comment: string;
    eventType: string;
    cocktailsServed: string[];
  }) {
    const prompt = `
    Przeanalizuj feedback klienta dla ELIKSIR:
    
    Ocena: ${feedback.rating}/5
    Komentarz: "${feedback.comment}"
    Wydarzenie: ${feedback.eventType}
    Koktajle: ${feedback.cocktailsServed.join(', ')}
    
    Zwróć JSON z analizą:
    {
      "sentiment": "positive|neutral|negative",
      "key_points": ["punkt1", "punkt2"],
      "improvement_suggestions": ["sugestia1", "sugestia2"],
      "follow_up_actions": ["akcja1", "akcja2"],
      "cocktail_performance": {
        "best_received": "nazwa koktajlu",
        "least_received": "nazwa koktajlu",
        "suggestions": "co zmienić"
      }
    }
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: 1500,
        temperature: 0.3, // Niższa temperatura dla analizy
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return JSON.parse(content.text);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('AI Feedback Analysis Error:', error);
      throw new Error('Failed to analyze feedback');
    }
  }

  /**
   * Generuje przewodnik po koktajlach dla barmanów
   */
  async generateBartenderGuide(cocktailName: string) {
    const prompt = `
    Stwórz profesjonalny przewodnik dla barmana do przygotowania koktajlu: ${cocktailName}
    
    Zwróć JSON:
    {
      "cocktail_name": "${cocktailName}",
      "preparation_steps": [
        {
          "step": 1,
          "action": "szczegółowy opis",
          "tip": "profesjonalna wskazówka",
          "timing": "czas w sekundach"
        }
      ],
      "ingredients_details": [
        {
          "ingredient": "nazwa",
          "amount": "ilość",
          "quality_notes": "na co zwrócić uwagę",
          "substitutes": ["alternatywa1", "alternatywa2"]
        }
      ],
      "equipment_needed": ["shaker", "strainer", "..."],
      "presentation": {
        "glass_type": "typ kieliszka",
        "garnish": "dekoracja",
        "serving_temperature": "temperatura"
      },
      "common_mistakes": ["błąd1", "błąd2"],
      "difficulty_level": "easy|medium|hard",
      "preparation_time": "czas w minutach"
    }
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: 3000,
        temperature: 0.4,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return JSON.parse(content.text);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('AI Bartender Guide Error:', error);
      throw new Error('Failed to generate bartender guide');
    }
  }
}

export default AIService;