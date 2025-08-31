import os
import re
import json
import io
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
import pytesseract
from PIL import Image
from PyPDF2 import PdfReader

# Load env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

app = FastAPI(title="Social Media Content Analyzer")

# Allow frontend (React/Vite) to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # you can restrict to ["http://localhost:5173"] for safety
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_pdf(file: UploadFile) -> str:
    file.file.seek(0)
    reader = PdfReader(file.file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.strip()

def extract_text_from_image(file: UploadFile) -> str:
    file.file.seek(0)
    image = Image.open(io.BytesIO(file.file.read()))
    text = pytesseract.image_to_string(image)
    return text.strip()

@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    try:
        # Decide based on file type
        if file.content_type == "application/pdf":
            extracted_text = extract_text_from_pdf(file)
        elif file.content_type.startswith("image/"):
            extracted_text = extract_text_from_image(file)
        else:
            return JSONResponse({"error": "Unsupported file type"}, status_code=400)

        if not extracted_text:
            return JSONResponse({"error": "No text found in file"}, status_code=400)

        # Gemini prompt
        prompt = f"""
        Analyze this social media content for engagement quality:
        ---
        {extracted_text}
        ---

        Return the result as VALID JSON only (no markdown, no code blocks).
        Structure:
        {{
          "sentiment": "positive/neutral/negative",
          "readability": "easy/medium/hard",
          "issues": ["list of problems"],
          "suggestions": {{
             "improved_post": "rewrite",
             "hashtags": ["list", "of", "hashtags"],
             "call-to-action": "string"
          }}
        }}
        """

        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # clean JSON if fenced
        clean_text = re.sub(r"```json|```", "", raw_text).strip()

        # try parsing
        try:
            analysis = json.loads(clean_text)
        except json.JSONDecodeError:
            return JSONResponse(
                {"error": f"Gemini returned invalid JSON: {raw_text}"}, status_code=500
            )

        return {"extracted_text": extracted_text, "analysis": analysis}

    except Exception as e:
        return JSONResponse({"error": f"Failed to analyze: {str(e)}"}, status_code=500)
