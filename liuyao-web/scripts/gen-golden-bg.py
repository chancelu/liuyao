"""Generate Chinese golden landscape background inspired by reference image."""
import os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from google import genai
from google.genai import types
from PIL import Image

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")

# Load reference image
ref_path = os.path.join(os.path.dirname(__file__), "ref-golden-landscape.jpg")

prompts = [
    {
        "name": "bg-golden-landscape-1",
        "prompt": """Create a wide panoramic background image in the exact same artistic style as this reference image.

Style: Chinese 金碧山水 (golden landscape painting) on pure black background.

Key elements:
- Pure black background with golden/copper line work
- Distant mountains rendered in golden outlines and subtle gold fill
- A large luminous golden moon in the upper portion
- Scattered stars/golden dots across the dark sky
- Wisps of golden clouds or mist between the mountains
- The mountains should fade from detailed in foreground to simple silhouettes in background
- Everything in warm gold tones (#C4956B, #D4A87B, #F0EBE3) on black

IMPORTANT differences from reference:
- Make it MORE subtle and atmospheric — less detailed, more misty
- Reduce the amount of detail — we want this as a website background, not a standalone painting
- Lower the overall brightness/opacity — it should be subtle enough for text to be readable on top
- NO buildings, NO cranes/birds, NO trees — just mountains, moon, clouds, stars
- The bottom half should fade to near-black (for content overlay)
- Wide format: 16:9 ratio (like 1920x1080)

The feeling: A distant golden mountain landscape seen through mist, mysterious and serene."""
    },
    {
        "name": "bg-golden-landscape-2",
        "prompt": """Create a dark atmospheric background in Chinese gold-on-black painting style (金碧山水).

This is for a website background, so it must be SUBTLE:
- Pure black background (#000000)
- Very distant mountain silhouettes in the lower third, rendered in soft golden lines
- A glowing golden moon (not too bright) in the upper right area
- Scattered tiny golden stars/particles across the sky
- Flowing golden mist/clouds between sky and mountains
- The mountains are minimal — just gentle curves with golden edges
- Overall opacity should be LOW — this goes behind text content
- The upper 2/3 should be mostly dark sky with subtle stars and one moon
- The lower 1/3 has fading mountain silhouettes

Color: warm gold (#C4956B to #D4A87B) on pure black
Format: wide 16:9 (1920x1080)
Style: minimalist Chinese ink painting with gold ink instead of black ink

Think: the quietest, most minimal version of a Chinese golden landscape — just enough to set the mood."""
    },
]

# Check if reference exists
ref_img = None
if os.path.exists(ref_path):
    ref_img = Image.open(ref_path)
    print(f"Reference image loaded: {ref_path}")
else:
    print(f"No reference image at {ref_path}, using text-only prompts")

for p in prompts:
    print(f"Generating: {p['name']}...")
    try:
        contents = []
        if ref_img:
            contents.append(ref_img)
        contents.append(p["prompt"])
        
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=contents,
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
