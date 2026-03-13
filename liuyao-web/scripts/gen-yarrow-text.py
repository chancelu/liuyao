"""Generate artistic YARROW text image on black background."""
import os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

prompts = [
    {
        "name": "yarrow-title",
        "prompt": """Create an artistic text logo that says "YARROW" on a pure black background.

Style requirements:
- The letters should look like they were written with golden ink that has a metallic, slightly weathered texture
- Think: ancient gold leaf inscription on a dark temple wall
- The gold color should be warm copper-gold (#C4956B to #D4A87B range)
- Letters should have subtle texture — like brushed metal or aged gold leaf with slight imperfections
- Very subtle golden glow/light emanating from the letters
- The font style should be elegant, thin, with wide letter spacing — like luxury brand typography
- ALL CAPS: Y A R R O W
- Wide letter spacing between each character

Composition:
- Pure black background (#000000)
- Text centered horizontally
- Wide format (roughly 4:1 ratio, like 1200x300)
- The text should be the ONLY element — no decorations, no borders, no other graphics
- Leave generous padding around the text

The feeling: An ancient golden inscription discovered in a dark temple, glowing faintly."""
    },
    {
        "name": "yarrow-title-v2",
        "prompt": """Create elegant text "YARROW" rendered in a luxurious metallic gold style on pure black background.

Visual style:
- Letters appear to be made of liquid gold or molten metal
- Warm gold tones (#C4956B, #D4A87B, #F0EBE3 highlights)
- Each letter has depth — like embossed or engraved metal
- Subtle light reflections on the letter surfaces
- Very fine, elegant serif or thin sans-serif letterforms
- Wide tracking (spacing) between letters
- Faint warm glow around the letters, like they're radiating heat

Technical:
- Pure black background (#000000)
- Wide format, approximately 1200x300 pixels
- Text perfectly centered
- NOTHING else in the image — just the word YARROW
- Clean, no noise, no extra elements

Reference mood: luxury jewelry brand logo meets ancient Chinese bronze inscription."""
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
