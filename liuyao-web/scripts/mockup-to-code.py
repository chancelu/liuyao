"""Convert design mockups to React/Tailwind code using Gemini vision."""
import os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from google import genai
from PIL import Image

client = genai.Client(api_key="AIzaSyCx0WlKS-X1KFrLY8B7YX4JdWySah9yD2g")
MOCKUP_DIR = os.path.join(os.path.dirname(__file__), "design-mockups")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "design-code")
os.makedirs(OUTPUT_DIR, exist_ok=True)

pages = [
    {
        "file": "01-homepage.png",
        "output": "01-homepage.tsx",
        "prompt": """You are an expert frontend developer. Look at this website design mockup carefully.

Generate a complete React component using Tailwind CSS that recreates this design as closely as possible.

Requirements:
- Use Tailwind CSS classes (not inline styles)
- Use Font Awesome icons (already loaded via CDN, use <i className="fa-solid fa-xxx"> syntax)
- Background effects: use CSS gradients, radial-gradient, box-shadow for glows
- Text effects: use text-shadow for glow effects
- The component should be a Next.js page component (export default function)
- Use these CSS variables: --bg-deep:#0D0B08, --bg-card:#1E1B14, --gold:#C4956B, --gold-light:#D4A87B, --text-primary:#F0EBE3, --text-muted:#8A8070, --text-dim:#5A5348
- Font: font-family uses Noto Serif SC (Chinese serif)
- Import Link from 'next/link'
- Make it responsive (mobile + desktop)
- Add hover effects on buttons (scale + glow)
- Add subtle animations (fade-in on load)
- This is the HOMEPAGE for "雅若 Yarrow" - a Chinese divination website
- The large character "爻" should be the visual anchor
- Keep the mystical, dark luxury aesthetic

Output ONLY the React component code, no explanations."""
    },
    {
        "file": "02-cast-page.png",
        "output": "02-cast-page.tsx",
        "prompt": """You are an expert frontend developer. Look at this website design mockup carefully.

Generate a complete React component using Tailwind CSS that recreates this design as closely as possible.

Requirements:
- Use Tailwind CSS classes
- Use Font Awesome icons (<i className="fa-solid fa-xxx">)
- This is the "起卦" (Start Divination) page where users input their question
- Include: question textarea, category selection pills, time scope pills, submit button
- Input fields should have gradient border effect on focus
- Category pills: 感情, 事业, 财运, 健康, 学业, 失物, 其他
- Time scope pills: 近期, 本月, 本年, 未限定
- Use CSS variables: --bg-deep:#0D0B08, --bg-card:#1E1B14, --gold:#C4956B, --text-primary:#F0EBE3, --text-muted:#8A8070
- Make it a client component ('use client') with useState for form state
- Add hover/focus effects
- Dark luxury Eastern mysticism aesthetic

Output ONLY the React component code, no explanations."""
    },
    {
        "file": "04-result-page.png",
        "output": "04-result-page.tsx",
        "prompt": """You are an expert frontend developer. Look at this website design mockup carefully.

Generate the CSS and layout structure (as a React component with Tailwind CSS) that recreates the visual style of this divination result page.

Requirements:
- This shows divination results with hexagram lines, hexagram name, and AI interpretation
- Hexagram lines: solid line for yang (阳), broken line for yin (阴)
- Large hexagram name in elegant serif font with gold accents
- Interpretation text sections separated by ornamental dividers
- Use CSS variables: --bg-deep:#0D0B08, --bg-card:#1E1B14, --gold:#C4956B, --text-primary:#F0EBE3, --text-muted:#8A8070
- Use Font Awesome icons
- Dark luxury scroll-like reading experience
- Add share button and back button at bottom

Output ONLY the React component code with mock data, no explanations."""
    },
    {
        "file": "05-login-page.png",
        "output": "05-login-page.tsx",
        "prompt": """You are an expert frontend developer. Look at this website design mockup carefully.

Generate a complete React component using Tailwind CSS that recreates this login page design.

Requirements:
- Two tabs: "验证码登录" (OTP) and "密码登录" (Password)
- Email input with gradient border on focus
- Password input (for password tab)
- Gold gradient login button with hover scale effect
- "新用户注册 →" link at bottom right
- "忘记密码？" link
- Large "爻" character at top as visual anchor with gold glow
- Use CSS variables: --bg-deep:#0D0B08, --bg-card:#1E1B14, --gold:#C4956B, --text-primary:#F0EBE3, --text-muted:#8A8070
- Use Font Awesome icons
- Make it a client component with useState for tab switching
- Dark luxury Eastern mysticism aesthetic

Output ONLY the React component code, no explanations."""
    },
]

for page in pages:
    filepath = os.path.join(MOCKUP_DIR, page["file"])
    if not os.path.exists(filepath):
        print(f"SKIP {page['file']} not found")
        continue
    
    print(f"Converting: {page['file']} -> {page['output']}...")
    img = Image.open(filepath)
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[img, page["prompt"]],
        )
        
        code = response.text
        # Strip markdown code fences if present
        if code.startswith("```"):
            lines = code.split("\n")
            code = "\n".join(lines[1:])  # remove first ```xxx line
            if code.rstrip().endswith("```"):
                code = code.rstrip()[:-3]
        
        outpath = os.path.join(OUTPUT_DIR, page["output"])
        with open(outpath, "w", encoding="utf-8") as f:
            f.write(code)
        print(f"  OK -> {outpath}")
        
    except Exception as e:
        print(f"  FAIL: {e}")

print("\nDone!")
