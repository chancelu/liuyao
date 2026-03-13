"""Generate artistic 爻 character and logo for Yarrow website."""
import os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from google import genai
from google.genai import types
from PIL import Image

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

assets = [
    {
        "name": "hero-yao",
        "prompt": """Create a single artistic Chinese calligraphy character "爻" (yao - meaning "lines of change" in I Ching divination).

Style: Ancient Chinese ink calligraphy on pure black background (#0D0B08). The character should look like it was written with a large brush in one fluid motion.

Effects:
- The ink strokes have a subtle golden-copper metallic sheen (color #C4956B)
- Soft golden glow emanating from the strokes, like the character is lit from within
- Very subtle ink splatter/spray around the edges of the strokes
- The background is pure dark (#0D0B08) with a very faint warm radial glow behind the character
- The character should feel powerful, ancient, and sacred

Size: Square composition, the character fills about 70% of the frame.
NO other text, NO other elements. Just the single character 爻 on dark background.
The overall feeling: an ancient oracle symbol glowing in darkness."""
    },
    {
        "name": "logo-yao",
        "prompt": """Create a small minimalist logo mark for "Yarrow" (雅若) - a Chinese divination brand.

The logo should be based on the Chinese character "爻" (yao) but stylized into a modern geometric mark:
- Abstract the character into clean geometric lines
- Use golden-copper color (#C4956B) on pure black background (#0D0B08)
- The mark should work at small sizes (32x32px to 64x64px)
- Subtle golden glow effect around the mark
- Think: luxury brand meets ancient Chinese calligraphy
- Clean, minimal, memorable
- Square composition

NO text, just the abstract mark/symbol. Pure black background."""
    },
    {
        "name": "bg-inkwash",
        "prompt": """Create a dark atmospheric background texture for a luxury website.

Style: Chinese ink wash painting (水墨画) effect on very dark background.

Details:
- Base color: very dark warm black (#0D0B08)
- Subtle ink wash clouds/smoke in warm golden-copper tones (rgba of #C4956B at very low opacity, around 5-15%)
- A hint of deep cinnabar red (#8B3A3A) at very low opacity in one corner
- The texture should be very subtle and atmospheric, NOT overpowering
- Think: smoke, mist, ink dissolving in water
- Organic, flowing shapes
- Should tile or work as a full-screen background
- Wide format (16:9 ratio)

The overall feeling: standing in a dark room where incense smoke catches faint golden light."""
    },
]

for asset in assets:
    print(f"Generating: {asset['name']}...")
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[asset["prompt"]],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )
        
        saved = False
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                filepath = os.path.join(OUTPUT_DIR, f"{asset['name']}.png")
                img = part.as_image()
                img.save(filepath)
                print(f"  OK -> {filepath}")
                saved = True
                break
            elif part.text is not None:
                print(f"  Text: {part.text[:100]}")
        
        if not saved:
            print("  FAIL: No image generated")
            
    except Exception as e:
        print(f"  FAIL: {e}")

print("\nDone!")
