"""Generate refined YARROW logo and hero images - round 2."""
import os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from google import genai
from google.genai import types
from PIL import Image

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")

# Load the approved background as style reference
bg_path = os.path.join(OUTPUT_DIR, "bg-golden-landscape-2.png")
ref_path = os.path.join(os.path.dirname(__file__), "ref-golden-landscape.jpg")
refs = []
for p in [ref_path, bg_path]:
    if os.path.exists(p):
        refs.append(Image.open(p))

prompts = [
    # ── Logos: ultra minimal ──
    {
        "name": "logo-r2-1",
        "use_ref": False,
        "prompt": """Draw a single tiny symbol on pure black background.

The symbol: three short horizontal golden lines stacked vertically with small gaps — the top line is solid, the middle line has a small break in the center, the bottom line is solid. Like a miniature I Ching trigram.

Style: painted with a single stroke of golden ink (#C4956B), slightly imperfect like a brush mark.
Size: the symbol should be small and centered in a square frame.
Background: pure black #000000.
Nothing else in the image. Extremely minimal."""
    },
    {
        "name": "logo-r2-2",
        "use_ref": False,
        "prompt": """On a pure black background, draw a small abstract mark:

Two thin golden curved lines that cross each other once, forming an X-like shape but with flowing, calligraphic curves — like two yarrow stalks (蓍草) crossed.

The lines are warm gold (#C4956B), thin, elegant, with slight brush texture.
The mark should be tiny and centered.
Pure black background. Nothing else. Ultra minimal."""
    },
    {
        "name": "logo-r2-3",
        "use_ref": False,
        "prompt": """On pure black background, draw a minimal golden circle with a single horizontal line through its center.

The circle is thin, slightly imperfect like drawn with a brush.
The horizontal line is also thin and brush-like.
Color: warm gold (#C4956B).
This represents the unity of yin and yang in its simplest form.

Centered in a square frame. Nothing else. Pure black background.
Extremely simple — just one circle and one line."""
    },
    # ── Hero: text integrated with landscape ──
    {
        "name": "hero-r2-1",
        "use_ref": True,
        "prompt": """Using the same art style as these reference images (Chinese golden landscape on black), create a new composition:

The image shows a vast dark sky taking up the top 70%. In the sky area, the word "YARROW" appears — but NOT as regular text. Instead, the letters are formed by:
- Thin golden constellation-like lines connecting golden star dots
- The letters are subtle, almost hidden among the real stars
- You have to look carefully to see them

Below: a single gentle mountain ridge in golden ink wash, very soft and misty.
A medium golden moon behind the mountains, partially hidden.
Golden mist rising from the mountains into the sky.

The overall image is very DARK. The YARROW constellation is subtle, not bright.
Wide 16:9 format. Pure black background with gold accents only."""
    },
    {
        "name": "hero-r2-2",
        "use_ref": True,
        "prompt": """Create a hero image in the same Chinese golden landscape style as these references.

Composition:
- Upper 60%: dark sky with scattered golden stars and one glowing moon (upper right)
- Center: the word "YARROW" written very large but at very LOW opacity (about 15-20% visible) — like a watermark or ghost text in the sky. The letters should be in thin, elegant serif font, golden color, barely visible.
- Lower 40%: soft golden mountain silhouettes with ink wash mist, fading to black at the bottom

The key: YARROW text should be BARELY visible, like a whisper in the sky. It's atmospheric, not a headline.
Wide 16:9. Gold on black only. Dark and moody."""
    },
    {
        "name": "hero-r2-3",
        "use_ref": True,
        "prompt": """Create a website hero image combining Chinese golden landscape with brand identity.

The scene:
- A beautiful dark landscape: one layer of soft golden mountains at the bottom, golden moon in the sky, stars scattered
- In the center of the sky, instead of text, there is a large but very faint golden 八卦 (bagua/eight trigrams) circular diagram — like a celestial compass
- The bagua is rendered in thin golden lines, very subtle, almost transparent
- Below the bagua, very small text "YARROW" in thin golden letters
- Golden mist connects the sky elements to the mountains below

Style: same as the reference images — Chinese 金碧山水 on black.
The bagua should be the visual centerpiece, not the text.
Wide 16:9. Very dark overall."""
    },
]

for p in prompts:
    print(f"Generating: {p['name']}...")
    try:
        contents = []
        if p.get("use_ref") and refs:
            contents.extend(refs)
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
