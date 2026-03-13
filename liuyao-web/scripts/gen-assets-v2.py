"""Generate new assets for Yarrow website v2."""
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
        "name": "hero-bg",
        "prompt": """Create a stunning dark atmospheric background image for a luxury website homepage.

Theme: Eastern mysticism, calm, grand, premium, mysterious.

Visual elements:
- Deep dark background, warm black tones
- Subtle golden-copper light rays or beams filtering through darkness, like light through temple doors
- Wisps of incense smoke or mist in warm golden tones
- Perhaps a faint silhouette of mountains or temple architecture in the far distance, barely visible
- Subtle bokeh-like golden particles floating in the air
- The overall composition should have depth - foreground mist, midground light, background darkness
- Color palette: deep blacks, warm copper-gold (#C4956B), hints of deep red

The feeling: Standing at the entrance of an ancient temple at dusk, golden light filtering through incense smoke. Sacred, mysterious, premium.

Wide format (16:9). NO text, NO characters, NO people. Pure atmospheric background."""
    },
    {
        "name": "logo-simple",
        "prompt": """Create a very simple, minimal abstract logo mark for a brand called "Yarrow".

Requirements:
- Extremely simple and clean - just 2-3 geometric strokes or shapes
- Inspired by the concept of hexagram lines (horizontal parallel lines) from I Ching
- Golden-copper color (#C4956B) on pure black background (#0D0B08)
- Think: 3 horizontal lines of varying lengths, or an abstract minimal symbol
- Must work at very small sizes (24px)
- NO text in the image
- NO complex details
- Style reference: like Apple logo simplicity meets Chinese calligraphy minimalism
- Square composition, symbol centered

The simpler the better. Less is more."""
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
