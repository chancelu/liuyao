"""Generate YARROW text - more traditional Chinese brush calligraphy feel."""
import os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")

prompts = [
    {
        "name": "yarrow-brush-1",
        "prompt": """Write the word "YARROW" using traditional Chinese calligraphy brush technique on pure black background.

Key style direction:
- The brush strokes should feel like 行书 (semi-cursive Chinese calligraphy) — flowing, connected, graceful
- NOT sharp or aggressive — soft, flowing, elegant movements
- The brush has plenty of ink — strokes are wet, rich, with natural ink bleeding at edges
- Some strokes flow into each other naturally, like a calligrapher writing without lifting the brush
- The ink color is warm gold (#C4956B to #D4A87B), like golden ink on black paper
- Strokes have natural thickness variation — press down for thick, lift for thin
- The overall rhythm should feel like Chinese calligraphy — balanced, harmonious, with breathing space
- NOT Western calligraphy or graffiti style — this is 东方书法 applied to English letters

Composition:
- Pure black background (#000000)
- Wide format (4:1 ratio)
- Letters centered with natural spacing
- ONLY the word YARROW
- No decorations

Mood: A Chinese calligraphy master (书法家) writing English letters with a soft brush, golden ink, on black xuan paper (宣纸). Gentle, flowing, meditative."""
    },
    {
        "name": "yarrow-brush-2",
        "prompt": """Create "YARROW" written with a soft Chinese calligraphy brush (毛笔) on black background.

Style:
- Imagine a Chinese 书法家 writing English letters — the strokes follow Chinese calligraphy principles
- 起笔 (start stroke): gentle entry, like the brush touching paper softly
- 行笔 (middle stroke): smooth, flowing, with natural curves
- 收笔 (end stroke): graceful finish, sometimes with a slight tail
- The ink is warm gold color (#C4956B), slightly translucent in places like real ink on paper
- Some areas show 墨韵 (ink resonance) — where ink pools slightly at turns or endings
- The letters should feel organic and hand-written, with the warmth of human touch
- Slightly irregular — not perfectly aligned, like real handwriting
- The brush is medium-soft, creating strokes that are round and full, not sharp

Technical:
- Pure black background (#000000)
- Wide format (1200x300 approximately)
- Centered
- ONLY YARROW, nothing else

Feel: Warm, meditative, like watching someone practice calligraphy in a quiet room. Eastern soul, Western letters."""
    },
    {
        "name": "yarrow-brush-3",
        "prompt": """Paint "YARROW" in Chinese ink wash calligraphy style on black background.

This should look like 水墨书法 (ink wash calligraphy):
- Soft, flowing brush strokes with lots of ink
- The gold ink (#C4956B, #D4A87B) bleeds and diffuses slightly at the edges, like ink on wet rice paper
- Each letter has a sense of movement and life — 气韵生动 (spirit resonance)
- The strokes are round, full, generous — not thin or sharp
- Some subtle ink mist or wash around the letters, very faint
- The spacing between letters is generous and balanced
- Think of how a Chinese painting master would write — each stroke is deliberate but natural

Important:
- This is NOT Western brush lettering or modern calligraphy
- This IS Chinese 毛笔 technique applied to English alphabet
- Soft, warm, contemplative — not edgy or cool

Background: pure black (#000000)
Format: wide (4:1)
Content: ONLY the word YARROW"""
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
