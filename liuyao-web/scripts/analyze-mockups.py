"""Analyze the generated design mockups using Gemini vision."""
import os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from google import genai
from PIL import Image

client = genai.Client(api_key="AIzaSyCx0WlKS-X1KFrLY8B7YX4JdWySah9yD2g")
MOCKUP_DIR = os.path.join(os.path.dirname(__file__), "design-mockups")

files = sorted([f for f in os.listdir(MOCKUP_DIR) if f.endswith('.png')])

for f in files:
    print(f"\n{'='*60}")
    print(f"Analyzing: {f}")
    print('='*60)
    
    img = Image.open(os.path.join(MOCKUP_DIR, f))
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                img,
                "Describe this website design mockup in detail in Chinese: layout, colors, typography, visual elements, overall quality. What works well? What needs improvement? Give specific CSS implementation details for a frontend developer."
            ],
        )
        print(response.text)
    except Exception as e:
        print(f"Error: {e}")
