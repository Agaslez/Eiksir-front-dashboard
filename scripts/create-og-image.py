#!/usr/bin/env python3
"""
Tworzy profesjonalny og-image (1200x630px) dla social media
"""
import os

from PIL import Image, ImageDraw, ImageFont

# Ścieżki
LOGO_PATH = "D:/REP/eliksir-website.tar/temp-gallery-upload/logo-eliksir-bar-mobilny.png"
OUTPUT_PATH = "d:/REP/eliksir-website.tar/eliksir-frontend/public/og-image.jpg"

# Wymiary og-image (standard Facebook/LinkedIn)
WIDTH = 1200
HEIGHT = 630

print("🎨 Tworzenie og-image dla ELIKSIR Bar...")

# Stwórz nowy obraz z gradientem
img = Image.new('RGB', (WIDTH, HEIGHT))
draw = ImageDraw.Draw(img)

# Elegancki gradient od ciemnego do złotego (tematyka bar koktajlowy)
for y in range(HEIGHT):
    # Gradient od #1a1a2e (ciemny granat) do #16213e do #0f3460
    ratio = y / HEIGHT
    r = int(26 + (15 - 26) * ratio)
    g = int(26 + (52 - 26) * ratio)
    b = int(46 + (96 - 46) * ratio)
    draw.rectangle([(0, y), (WIDTH, y + 1)], fill=(r, g, b))

# Dodaj złoty akcent na dole
overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
overlay_draw = ImageDraw.Draw(overlay)
# Złoty gradient na dole
for y in range(HEIGHT - 150, HEIGHT):
    alpha = int((y - (HEIGHT - 150)) / 150 * 60)
    overlay_draw.rectangle([(0, y), (WIDTH, y + 1)], fill=(218, 165, 32, alpha))

img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')

# Wczytaj logo
try:
    logo = Image.open(LOGO_PATH).convert('RGBA')
    
    # Przeskaluj logo do odpowiedniego rozmiaru (max 400px wysokości)
    logo_max_height = 300
    aspect_ratio = logo.width / logo.height
    new_height = min(logo_max_height, logo.height)
    new_width = int(new_height * aspect_ratio)
    logo = logo.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Umieść logo po lewej stronie
    logo_x = 80
    logo_y = (HEIGHT - new_height) // 2
    
    # Nakładanie logo z przezroczystością
    img.paste(logo, (logo_x, logo_y), logo)
    
    print(f"✅ Logo dodane: {new_width}x{new_height}px")
    
except Exception as e:
    print(f"⚠️  Nie udało się wczytać logo: {e}")
    logo_x = 0
    new_width = 0

# Dodaj tekst po prawej stronie
draw = ImageDraw.Draw(img)

# Próbuj użyć systemowej czcionki
try:
    # Dla Windows
    title_font = ImageFont.truetype("arial.ttf", 72)
    subtitle_font = ImageFont.truetype("arial.ttf", 42)
except:
    try:
        # Alternatywna czcionka
        title_font = ImageFont.truetype("DejaVuSans-Bold.ttf", 72)
        subtitle_font = ImageFont.truetype("DejaVuSans.ttf", 42)
    except:
        # Fallback na domyślną
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()

# Pozycjonowanie tekstu po prawej od logo
text_x = logo_x + new_width + 60
text_y_start = 180

# Rysuj tekst z cieniem
# Tytuł "ELIKSIR"
shadow_offset = 3
draw.text((text_x + shadow_offset, text_y_start + shadow_offset), "ELIKSIR", 
          fill=(0, 0, 0, 180), font=title_font)
draw.text((text_x, text_y_start), "ELIKSIR", 
          fill=(218, 165, 32), font=title_font)  # Złoty kolor

# Podtytuł
subtitle_y = text_y_start + 90
draw.text((text_x + shadow_offset, subtitle_y + shadow_offset), "Mobilny Bar", 
          fill=(0, 0, 0, 180), font=subtitle_font)
draw.text((text_x, subtitle_y), "Mobilny Bar", 
          fill=(255, 255, 255), font=subtitle_font)

subtitle_y2 = subtitle_y + 55
draw.text((text_x + shadow_offset, subtitle_y2 + shadow_offset), "Koktajlowy", 
          fill=(0, 0, 0, 180), font=subtitle_font)
draw.text((text_x, subtitle_y2), "Koktajlowy", 
          fill=(255, 255, 255), font=subtitle_font)

# Zapisz jako JPG (lepszy dla social media)
img.save(OUTPUT_PATH, 'JPEG', quality=95, optimize=True)

file_size = os.path.getsize(OUTPUT_PATH)
print(f"✅ og-image.jpg utworzony: {WIDTH}x{HEIGHT}px ({file_size // 1024}KB)")
print(f"📁 Lokalizacja: {OUTPUT_PATH}")
print("🎉 Gotowe! Teraz link na Facebooku/LinkedIn pokaże ładny podgląd")
