# GrowEasy AI-Powered CSV Importer

An intelligent, full-stack CSV importer that uses AI to automatically map, validate, and standardize messy CSV data into a strict CRM format. Built for the GrowEasy Assignment.

## 🚀 Key Features (100% Requirements Fulfilled)

1. **AI Header Mapping:** Users can upload any CSV (Facebook, Google Ads, arbitrary headers). Gemini AI automatically identifies column meanings and maps them to CRM fields.
2. **Data Standardization & Validation:**
   - **Phones:** Splits phone numbers into `country_code` and `mobile_without_country_code`. Defaults to `+1`.
   - **Emails:** Uses the first email as primary, appends secondary emails to `crm_note`.
   - **Enums:** Normalizes diverse status strings into strict CRM formats (`GOOD_LEAD_FOLLOW_UP`, `BAD_LEAD`, `DID_NOT_CONNECT`, `SALE_DONE`).
3. **Massive Batching (Speed):** The backend leverages Gemini's 1 Million Token Context Window to process massive 250-row batches in a single API call, completely bypassing rate limit issues and extracting 250+ rows in ~10 seconds.
4. **Virtualized Table (Bonus):** Implements `react-window` on the frontend to render thousands of loaded records seamlessly at 60fps without crashing the browser.
5. **Beautiful UI:** Custom premium UI with glassmorphism, animated layouts (Framer Motion), dark mode support, and a responsive workspace dashboard.
6. **Unit Tests (Bonus):** Includes Jest unit tests for the data transformation logic.
7. **Docker Support (Bonus):** Full Dockerization for both the Next.js frontend and Node.js backend.

## 🏗 Tech Stack

- **Frontend:** Next.js (React), Vanilla CSS, Framer Motion, react-window
- **Backend:** Node.js, Express, TypeScript, Zod, Papaparse
- **AI Engine:** Google Gemini (Generative AI)

## 💻 Local Setup (Without Docker)

### 1. Prerequisites
- Node.js >= 18
- A Gemini API Key (from Google AI Studio)

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Backend Setup
```bash
npm install
npm run dev
```
The API will run on `http://localhost:3001`

### 4. Frontend Setup
Open a new terminal in the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
The app will run on `http://localhost:3000`

## 🐳 Docker Setup (Bonus)

You can run the entire stack using Docker Compose:

1. Ensure your `.env` file has your `GEMINI_API_KEY`.
2. Run:
```bash
docker-compose up --build
```
This will start both the backend API (port 3001) and the Next.js frontend (port 3000) simultaneously.

## 🧪 Running Unit Tests (Bonus)
The transformation logic that parses phones, emails, and CRM statuses is strictly tested.
```bash
npm test
```

## 🧩 How It Works

1. **Upload:** User drops a CSV file.
2. **Analysis:** The Node.js backend reads a chunk of rows and asks Gemini to guess the column headers based on context.
3. **Review:** The UI presents the AI mappings to the user, who can adjust them.
4. **Extraction:** The backend streams the CSV in batches of 250, mapping data and transforming messy fields via strict Regex and AI fallbacks.
5. **Preview:** Records are presented in a highly-performant virtualized table using `react-window`.
