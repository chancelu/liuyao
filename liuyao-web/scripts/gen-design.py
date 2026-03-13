"""
Generate design mockups for Yarrow (雅若) website pages using Gemini image generation.
"""
import os
import sys
from google import genai
from google.genai import types

client = genai.Client(api_key="AIzaSyCx0WlKS-X1KFrLY8B7YX4JdWySah9yD2g")

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "design-mockups")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Page design prompts based on design-v2.md
pages = [
    {
        "name": "01-homepage",
        "prompt": """Design a stunning dark luxury website homepage for "Yarrow 雅若" - an ancient Chinese divination (I Ching / 六爻) web app.

Style: Eastern mysticism meets modern minimalism. Think Kenya Hara meets luxury brand design.

Layout:
- Full-screen hero section, nearly empty
- Center: A single large Chinese character "爻" (yao) in elegant serif font, size ~180px, with subtle golden glow/shadow
- Below the character: "雅若 Yarrow" in small gold shimmer text with wide letter-spacing
- Below that: "六爻在线占卦" (Chinese divination online) in muted warm gray
- A single call-to-action button "问卦" (Ask the Oracle) with gold gradient background, rounded pill shape
- At the very bottom in tiny italic text: "Ancient Chinese divination, reimagined."

Background: Deep warm black (#0D0B08), NOT pure black. Multiple layers of subtle warm golden radial gradients creating an ink-wash/smoke effect. Subtle noise texture overlay for paper feel.
- Faint vertical Chinese text on left and right edges as decorative elements
- Thin decorative gold line with diamond symbol between tagline and button

Color palette: Background #0D0B08, Gold #C4956B, Text #F0EBE3 (warm white), Muted #8A8070
Typography: Elegant Chinese serif font, very thin weight, generous spacing

Navigation bar at top: Left side "爻 Yarrow" logo, right side minimal links with small icons.
The overall feeling should be like entering a dark meditation room with one warm golden light. Luxurious, mysterious, sacred."""
    },
    {
        "name": "02-cast-page",
        "prompt": """Design a dark luxury web page for asking a divination question on "Yarrow 雅若" website.

Style: Eastern mysticism, minimal, sacred feeling. Dark warm background.

Layout:
- Top center: Small gold label "起卦" (Start Divination) in tiny uppercase tracking
- Below: Large title "心中所问" (What's in your heart) in elegant thin serif
- Thin gold decorative line
- A large text input area with NO visible border, only a subtle gold bottom line - like writing on rice paper
- Below the input: Category selection pills (感情/事业/财运/健康/学业) in rounded border buttons, gold highlight when selected
- Time scope selection (近期/本月/本年) similar style
- A "问卦" (Ask) button centered, gold gradient, pill shape with coin icon
- Generous whitespace everywhere

Background: Deep warm black with subtle golden radial glow at top center.
Color palette: Background #0D0B08, Gold #C4956B, Text #F0EBE3, Muted #8A8070
The feeling: quiet, focused, like a moment of meditation before asking a question."""
    },
    {
        "name": "03-ritual-page",
        "prompt": """Design a dark immersive web page for the coin-tossing ritual on "Yarrow 雅若" divination website.

Style: Full-screen ritual experience. Maximum immersion, minimum UI.

Layout:
- Nearly empty dark screen
- Center: Three ancient Chinese copper coins (铜钱) arranged in a triangle, with subtle golden glow
- Below the coins: The hexagram lines being built - showing 4 out of 6 lines already cast
  - Each line is either solid (yang ——) or broken (yin — —)
  - Lines stack from bottom to top
  - The most recent line has a subtle gold glow animation
- NO progress bar, NO buttons visible, NO text labels
- Only a very faint hint text "触摸掷卦" (Touch to cast) that fades after first interaction
- Background subtly shifts from pure dark to slightly warm golden as more lines are cast

Background: Deep black with very subtle warm glow emanating from the coins.
The feeling: sacred ritual, like being alone in a dark temple. Every tap is meaningful."""
    },
    {
        "name": "04-result-page",
        "prompt": """Design a dark luxury web page showing divination results on "Yarrow 雅若" website.

Style: Like unrolling an ancient scroll. Eastern mysticism with modern typography.

Layout:
- Top: The hexagram drawn with elegant thick/thin lines (yang=thick solid line, yin=two thin segments with gap)
- Hexagram name in large elegant serif: "雷山小过" with English "Thunder over Mountain"
- Palace and element info in small muted text
- Thin gold decorative divider with diamond symbol
- AI interpretation text in warm white, generous line-height (2.0), broken into sections:
  - "总论" (Overview) section
  - "详解" (Detailed Analysis) section  
  - "建议" (Advice) section
- Each section separated by ornamental dividers
- Share button and back button at bottom, minimal style with icons

Background: Deep warm black with subtle glow behind the hexagram.
Color palette: Background #0D0B08, Gold #C4956B, Text #F0EBE3
Typography: Chinese serif, thin weight, very generous spacing and line-height.
The feeling: reading an ancient text by candlelight, but with modern clarity."""
    },
    {
        "name": "05-login-page",
        "prompt": """Design a dark luxury login page for "Yarrow 雅若" divination website.

Style: Minimal, warm, inviting. Eastern mysticism aesthetic.

Layout:
- Top center: Large gold "爻" character as visual anchor with subtle glow
- Below: "入" (Enter) as page title in elegant thin serif
- Thin gold decorative line
- A card with subtle warm background and thin gold border, rounded corners (16px)
- Inside the card: Two tab buttons "验证码登录" (OTP Login) and "密码登录" (Password Login)
  - Active tab has warm background highlight
- Email input field with gradient gold border on focus
- Password input field (for password tab)
- Gold gradient "登录" (Login) button, pill shape
- Bottom right: Small text link "新用户注册 →" (New user register)
- Bottom: "忘记密码？" (Forgot password?) link

Background: Deep warm black with subtle golden glow at top.
Color palette: Background #0D0B08, Gold #C4956B, Card #1E1B14, Text #F0EBE3
The feeling: a warm welcome into a sacred space."""
    },
]

print(f"Generating {len(pages)} design mockups...")

for page in pages:
    print(f"\n→ Generating: {page['name']}...")
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[page["prompt"]],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )
        
        saved = False
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                filepath = os.path.join(OUTPUT_DIR, f"{page['name']}.png")
                img = part.as_image()
                img.save(filepath)
                print(f"  OK Saved: {filepath}")
                saved = True
                break
            elif part.text is not None:
                print(f"  Text: {part.text[:200]}")
        
        if not saved:
            print("  FAIL No image generated")
            
    except Exception as e:
        print(f"  FAIL Error: {e}")

print(f"\nDone! Check {OUTPUT_DIR}")
