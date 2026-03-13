"""Generate YARROW logo and hero compositions on dark golden landscape background."""
import os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from google import genai
from google.genai import types
from PIL import Image

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")

# Load current background as reference
bg_path = os.path.join(OUTPUT_DIR, "bg-golden-landscape-2.png")
bg_img = Image.open(bg_path) if os.path.exists(bg_path) else None

prompts = [
    # ── Logo options ──
    {
        "name": "logo-v2-a",
        "prompt": """Design a small square logo for "YARROW" — a Chinese I Ching divination brand.

The logo should:
- Be an abstract symbol combining the concept of 爻 (yao lines) with a natural/organic element
- Use 2-3 simple golden brush strokes that suggest both hexagram lines and yarrow stalks (蓍草)
- Warm gold color (#C4956B) on pure black background (#000000)
- Minimalist — must work at 32px size
- Feel hand-brushed, not geometric or digital
- NO text, just the symbol

Think: if a calligrapher drew a tiny mark that captures the essence of divination in one breath.
Square format, symbol centered."""
    },
    {
        "name": "logo-v2-b",
        "prompt": """Create a minimal logo mark for divination brand "YARROW".

The mark is a stylized 卦 (hexagram) symbol:
- Three pairs of horizontal lines (like a hexagram), but abstracted and elegant
- The lines have slight brush-stroke quality — not perfectly straight
- Some lines are solid (阳), some broken (阴)
- Warm gold (#C4956B) on pure black (#000000)
- Very clean, very minimal
- Must be recognizable at small sizes (24-32px)

Square format. NO text. Just the hexagram mark.
Think: the simplest possible representation of I Ching in one icon."""
    },
    # ── Hero compositions ──
    {
        "name": "hero-comp-1",
        "prompt": """Create a website hero image that combines the word "YARROW" with a mystical Chinese landscape background.

The composition:
- Background: dark scene with distant golden mountain silhouettes, a glowing moon, scattered stars — Chinese 金碧山水 style
- The word "YARROW" is integrated into the scene — the letters appear to be made of golden light or mist, floating in the sky area
- The text should feel like it BELONGS in the landscape, not pasted on top
- Below the text: "六爻在线占卦" in smaller, subtle golden text
- A faint circular 八卦 (bagua) pattern behind the text, barely visible
- The mountains are in the lower 30%, soft and misty
- Stars and golden particles scattered throughout

Color: warm gold (#C4956B, #D4A87B) on black
Format: wide 16:9 (1920x1080)
Style: the text and landscape are one unified artwork, not text-over-image"""
    },
    {
        "name": "hero-comp-2",
        "prompt": """Design a hero banner for "YARROW" Chinese divination website.

Layout (top to bottom):
- Top: dark sky with scattered golden stars
- Upper center: the word "YARROW" in elegant thin golden letters, with a subtle glow
- Below text: a thin golden decorative line with a small diamond shape in the center
- Below that: "六爻在线占卦" in very small golden text
- Lower half: golden ink wash mountains fading into darkness, with a luminous moon rising behind them
- Golden mist/clouds flowing between the text area and the mountains

The key: the text area and the landscape should blend seamlessly through mist and particles.
Everything in warm gold tones on pure black.
Wide format 16:9.
Style: luxury brand meets Chinese ink painting."""
    },
    {
        "name": "hero-comp-3",
        "prompt": """Create a full-screen hero visual for "YARROW" — a Chinese divination app.

Concept: "The Oracle's View" — looking up at the night sky from inside an ancient temple

Elements:
- Pure black edges (like looking through a temple doorway or window frame)
- Center: vast dark sky with golden stars and a luminous golden moon
- "YARROW" text in the sky, rendered in golden light — as if the stars formed the letters
- Very faint golden mountain silhouettes at the bottom horizon
- Wisps of golden incense smoke rising from the bottom
- A subtle 太极 (yin-yang) shape formed by the smoke/clouds, barely perceptible
- "六爻在线占卦" in tiny text below YARROW

Color: gold (#C4956B) on black
Format: 16:9 wide
The feeling: sacred, vast, like the universe is speaking to you"""
    },
    {
        "name": "hero-comp-4",
        "prompt": """Design a hero image for Chinese divination brand "YARROW".

Concept: Minimalist golden landscape with integrated typography

- The bottom third: a single layer of soft golden mountain silhouettes, painted in ink wash style
- Above the mountains: golden mist rising
- In the mist/sky area: "YARROW" in refined golden letters that emerge from the mist — the bottom of the letters fade into the mist
- A golden moon (not too large) in the upper right
- Scattered golden dust/stars in the sky
- Very subtle: tiny hexagram line symbols (solid and broken lines) floating like constellations among the stars
- Below YARROW: thin ornamental line + "六爻在线占卦"

The overall image should be DARK — mostly black with golden accents.
The text should feel like it's part of the atmosphere, not overlaid.
Wide 16:9 format. Gold on black only."""
    },
]

for p in prompts:
    print(f"Generating: {p['name']}...")
    try:
        contents = []
        if bg_img and 'hero' in p['name']:
            contents.append(bg_img)
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
