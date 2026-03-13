"""Generate YARROW hero image with I Ching / bagua / yinyang imagery + text."""
import os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")

prompts = [
    {
        "name": "yarrow-hero-1",
        "prompt": """Create a mystical hero image for a Chinese divination website called "YARROW".

The image should contain:
- The word "YARROW" in elegant golden calligraphy, centered
- Behind/around the text: a faint, ethereal 八卦 (bagua/eight trigrams) circular diagram
- The bagua should be rendered in soft golden ink wash style, partially fading into darkness
- Subtle 阴阳 (yin-yang) symbol integrated into the composition, perhaps above or within the bagua
- Hexagram lines (阳爻 solid lines, 阴爻 broken lines) floating or scattered subtly in the background
- Wisps of golden ink smoke/mist weaving through the composition
- Everything rendered in warm gold tones (#C4956B, #D4A87B, #F0EBE3) on pure black background

Style: Chinese ink wash painting meets mystical sacred geometry. Ethereal, mysterious, premium.
The bagua and symbols should be subtle and atmospheric, NOT sharp or technical-looking.
Format: wide (16:9 or 3:1), centered composition.
Background: pure black (#000000)."""
    },
    {
        "name": "yarrow-hero-2",
        "prompt": """Design a dark, atmospheric hero banner for "YARROW" — a Chinese I Ching divination brand.

Composition (layered, back to front):
1. Background: pure black
2. Far back: very faint circular 八卦 (bagua) pattern in dim gold, like an ancient engraving barely visible
3. Middle: soft golden ink wash clouds/mist, flowing organically
4. Scattered: several hexagram trigram symbols (三爻 — groups of 3 solid or broken lines) floating in the mist, rendered in gold ink wash
5. Center: a luminous 阴阳 (yin-yang) symbol, not too large, glowing softly in gold
6. Foreground: the word "YARROW" in refined, wide-spaced golden letters across the center

Color palette: ONLY warm golds (#C4956B, #D4A87B) and black. No other colors.
Style: sacred, mysterious, like peering into an ancient oracle's chamber.
The trigram symbols and bagua should look hand-painted with a brush, not digital/geometric.
Format: wide (approximately 1400x500).
Pure black background."""
    },
    {
        "name": "yarrow-hero-3",
        "prompt": """Create a stunning visual for Chinese divination brand "YARROW" on black background.

Elements to include:
- "YARROW" text in golden brush calligraphy style, centered
- An abstract composition of 爻 (yao) lines — solid yang lines and broken yin lines — arranged artistically around the text, like they're floating in space
- These lines should look like golden brush strokes, with ink wash texture
- A subtle circular motif suggesting the 太极 (taiji/yin-yang) concept — perhaps two flowing curves of golden ink
- Tiny golden particles or dots scattered throughout, like stars or golden dust
- The overall composition should feel like a cosmic mandala made of I Ching symbols
- Everything in warm gold (#C4956B, #D4A87B, #F0EBE3) on pure black

Style: mystical, cosmic, Eastern. Like a sacred diagram floating in the void.
NOT cartoonish or literal — abstract, artistic, atmospheric.
Wide format (3:1 ratio). Pure black background (#000000)."""
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
