"""Generate improved golden landscape bg - more ink wash, fewer lines."""
import os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from google import genai
from google.genai import types
from PIL import Image

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")

ref_path = os.path.join(os.path.dirname(__file__), "ref-golden-landscape.jpg")
ref2_path = os.path.join(OUTPUT_DIR, "bg-golden-landscape-2.png")

images = []
if os.path.exists(ref_path):
    images.append(Image.open(ref_path))
if os.path.exists(ref2_path):
    images.append(Image.open(ref2_path))

prompts = [
    {
        "name": "bg-golden-v3",
        "prompt": """Based on these reference images, create an improved version with these changes:

MORE ink wash / watercolor feeling:
- The mountains should look like they were painted with diluted golden ink, with soft edges that bleed and diffuse
- Add more 水墨 (ink wash) clouds and mist — soft, flowing, organic shapes in gold
- The golden tones should have varying opacity — some areas rich gold, some fading to barely visible
- Think Chinese ink wash painting (水墨画) but with gold ink instead of black

FEWER hard lines:
- Remove any sharp outlines or detailed line work
- Mountains should be soft silhouettes, not outlined shapes
- Everything should feel misty, atmospheric, dreamlike

Keep from version 2:
- The golden moon in upper area
- Stars/particles in the sky
- The overall dark composition with mountains in lower third
- Pure black background

The bottom 40% should gradually fade to pure black (for text overlay).
Wide format 16:9 (1920x1080).
Color: warm gold (#C4956B, #D4A87B) on pure black.

The feeling: a golden dream of distant mountains, seen through layers of mist."""
    },
]

for p in prompts:
    print(f"Generating: {p['name']}...")
    try:
        contents = images + [p["prompt"]]
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
