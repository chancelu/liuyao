"""Generate mystical Chinese hero images - NOT landscapes."""
import os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")

prompts = [
    {
        "name": "hero-mystical-1",
        "prompt": """Create a mystical image on pure black background in Chinese ink wash style with gold ink.

Subject: Three ancient Chinese copper coins (铜钱) suspended in mid-air, surrounded by swirling golden ink smoke. The coins are round with square holes in the center. They appear to be falling or spinning slowly.

Style:
- Chinese 水墨 (ink wash) technique but using gold ink (#C4956B, #D4A87B) instead of black
- The coins have detailed ancient Chinese inscriptions, rendered in fine golden lines
- Golden ink smoke/mist swirls around and between the coins
- Tiny golden particles float in the air around them
- The smoke has organic, flowing shapes — like real ink dissolving in water
- Everything glows faintly with warm golden light

Background: pure black (#000000)
Format: square or slightly tall (3:4 ratio)
The feeling: three sacred coins frozen in the moment of divination, surrounded by mystical energy.
NO text. NO landscape. Just the coins and smoke."""
    },
    {
        "name": "hero-mystical-2",
        "prompt": """Create a mystical image on pure black background.

Subject: A bundle of yarrow stalks (蓍草) — thin, elegant plant stems — arranged vertically, held together loosely. The stalks are rendered in golden ink wash style.

Around the stalks:
- Golden ink smoke rising upward from the stalks, dissolving into the darkness
- Faint golden light emanating from the center of the bundle
- Small golden particles or sparks floating upward
- The smoke forms subtle, barely visible patterns — hints of hexagram lines or ancient symbols

Style: Chinese ink wash painting (水墨画) with warm gold (#C4956B) on pure black
The stalks should look organic, natural, slightly wild — not arranged perfectly
The golden smoke should be soft, flowing, atmospheric

Format: tall portrait (3:4 or 2:3 ratio)
Background: pure black
NO text. NO landscape. Just the yarrow stalks and golden smoke."""
    },
    {
        "name": "hero-mystical-3",
        "prompt": """Create a mystical image on pure black background.

Subject: An ancient Chinese bronze mirror (铜镜) seen from the front, floating in darkness. The mirror is circular with intricate patterns on its surface.

The mirror surface shows:
- Concentric circles with ancient Chinese patterns
- A 八卦 (bagua) pattern in the center
- Fine decorative borders with mythical creatures or cloud patterns
- All rendered in warm gold (#C4956B) with varying opacity

Around the mirror:
- Golden ink wash mist/smoke swirling around the edges
- The mirror seems to emit a soft golden glow
- Tiny golden particles floating outward from the mirror
- The reflection surface has a subtle, mysterious shimmer

Style: Chinese ink wash meets ancient bronze artifact
Format: square or slightly tall
Background: pure black (#000000)
NO text. Just the mirror floating in darkness."""
    },
    {
        "name": "hero-mystical-4",
        "prompt": """Create a mystical abstract image on pure black background using Chinese ink wash style with golden ink.

Subject: Abstract golden ink wash composition — NOT a specific object. Instead:
- Large flowing golden ink strokes that suggest movement and energy
- The ink appears to be dissolving and diffusing in water, creating organic cloud-like shapes
- Within the ink wash, very faint hexagram lines (solid and broken) appear and disappear
- A central area of brighter gold that draws the eye, like a source of light
- The ink flows outward from the center in all directions
- Some areas are dense gold, others are barely visible wisps

Style: pure abstract 水墨 (ink wash) art, but in gold instead of black
Think: what divination energy looks like if you could see it
The composition should feel alive, dynamic, mysterious

Color: warm gold (#C4956B, #D4A87B, #F0EBE3) on pure black
Format: roughly square or 4:3
NO text. NO recognizable objects. Pure abstract ink wash."""
    },
    {
        "name": "hero-mystical-5",
        "prompt": """Create a mystical image on pure black background.

Subject: A single ancient Chinese oracle bone (甲骨) fragment floating in darkness. The bone fragment is irregular in shape, like a real archaeological artifact.

On the bone surface:
- Ancient oracle bone script (甲骨文) characters carved/inscribed, glowing in gold
- The inscriptions are mysterious, ancient, barely legible
- Cracks in the bone (used in ancient divination) that glow with golden light from within

Around the bone:
- Golden smoke/mist rising from the cracks
- Tiny golden embers or sparks floating upward
- The bone casts a soft golden glow on the surrounding darkness

Style: photorealistic bone texture combined with mystical golden glow
Color: warm gold (#C4956B) on pure black
Format: roughly square
NO text. Just the oracle bone floating in mystical darkness."""
    },
]

for p in prompts:
    print(f"Generating: {p['name']}...")
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[p["prompt"]],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )
        saved = False
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                filepath = os.path.join(OUTPUT_DIR, f"{p['name']}.png")
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
