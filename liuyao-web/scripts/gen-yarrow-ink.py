"""Generate YARROW text with Chinese ink brush calligraphy style."""
import os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")

prompts = [
    {
        "name": "yarrow-ink-1",
        "prompt": """Create the word "YARROW" written in Chinese ink brush calligraphy style on pure black background.

Style:
- The English letters should be written as if by a Chinese calligraphy brush (毛笔)
- Ink wash (水墨) texture — you can see the brush strokes, dry brush marks, ink splatter
- The ink color is warm gold/copper (#C4956B) instead of traditional black ink
- Each letter has visible brush stroke texture — thick and thin variations, like real calligraphy
- Some strokes have "飞白" (flying white) effect — where the brush runs dry and you see gaps in the stroke
- Subtle ink drops or splatter around the letters
- The overall feeling is: Western letters written with Eastern soul

Composition:
- Pure black background (#000000)
- Wide format (4:1 ratio, like 1200x300)
- Text centered, generous spacing between letters
- ONLY the word YARROW, nothing else

Mood: A calligraphy master writing English letters with a Chinese brush, golden ink on black paper."""
    },
    {
        "name": "yarrow-ink-2",
        "prompt": """Create artistic text "YARROW" in Chinese water-ink (水墨画) painting style on black background.

Requirements:
- Letters look like they are painted with diluted golden ink on black rice paper
- Watercolor/ink wash effect — some parts of letters are darker gold, some lighter, some have ink bleeding/diffusion
- The strokes should feel organic, hand-painted, imperfect — NOT digital or clean
- Color: warm gold tones (#C4956B, #D4A87B) with some areas fading to very light gold (#F0EBE3)
- Some ink wash clouds or mist subtly surrounding the letters
- The letters should have varying opacity — some strokes bold, some fading like ink dissolving in water
- Think: 书法 meets modern typography

Technical:
- Pure black background (#000000)  
- Wide format approximately 1200x300
- Centered text with wide letter spacing
- ONLY the word YARROW

The feeling: ancient Chinese ink painting technique applied to modern Western typography."""
    },
    {
        "name": "yarrow-ink-3",
        "prompt": """Write "YARROW" in a style that blends Chinese seal script (篆书) aesthetics with modern English letters, on pure black background.

Details:
- The letters should have the angular, structured quality of Chinese seal script but remain readable as English
- Rendered in warm gold (#C4956B) with subtle ink texture
- Each letter stroke has the weight and deliberateness of a seal carving
- Slight stone-carved texture on the strokes
- A very faint red seal stamp (印章) mark in the corner as a small accent
- Minimal, powerful, ancient feeling

Composition:
- Pure black background
- Wide format (4:1)
- Centered, wide spacing
- ONLY YARROW text (and optional tiny seal stamp)

Mood: An ancient bronze vessel inscription reimagined as modern branding."""
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
