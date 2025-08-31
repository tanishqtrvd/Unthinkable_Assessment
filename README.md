# Unthinkable_Assessment

A web-based tool that allows users to upload *PDFs, images, or text files* and get AI-powered insights into their social media content.  

The app performs:  
- ✅ Sentiment Analysis  
- ✅ Readability Scoring  
- ✅ Issue Detection  
- ✅ Recommendations (hashtags, call-to-actions, etc.)  
- ✅ AI-Powered Rewrites for Improved Posts  

---

## 🚀 Features
- Drag & drop file uploads (*PDF, PNG, JPG, TXT supported*).  
- Backend API processes files and extracts content.  
- AI/ML models analyze sentiment, readability, and content quality.  
- Smart recommendations (hashtags, CTAs, rewrites).  
- Copy-to-clipboard functionality for results.  
- Deployed on *Vercel (frontend)* and *Render (backend)*.  

---

## 🛠 Tech Stack

### *Frontend*
- React.js  
- React Markdown (for rendering clean outputs)  
- Bootstrap / Custom CSS  
- Vercel (Deployment)  

### *Backend*
- FastAPI (Python)  
- OCR model (Tesseract for image/PDF text extraction)  
- File handling with FormData (PDFs, images, text)  
- Render (Deployment with Docker)  

---

## 📂 Project Structure

bash
social-media-analyser
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.jsx         # Main UI logic
│   │   ├── styles.css      # Custom styling
│   │   ├── api.js          # API calls
│   │   └── main.jsx
│   └── package.json
│
├── backend/                # FastAPI backend
│   ├── main.py             # API routes (/analyze)
│   ├── requirements.txt    # Backend dependencies
│   └── Dockerfile          # Backend Docker image
│
├── README.md               # Documentation
└── .gitignore              # Ignore build/env files

---

## ⚡ Setup & Installation  


## 1️⃣ Clone the Repository  

bash
git clone https://github.com/tanishqtrvd/Unthinkable_Assessment.git
cd social-media-analyser


---

### 2️⃣ Frontend Setup  

bash
cd frontend
npm install
npm run dev

---

### 3️⃣ Backend Setup

bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
