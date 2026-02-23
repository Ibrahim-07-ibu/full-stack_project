# HomeBuddy - Full-Stack Service Manager

Welcome to HomeBuddy! The project has been reorganized to be as clean as possible.

## 🚀 Getting Started

To run the project locally, follow these steps:

1. **Install Dependencies**:
   - Ensure you have Python installed.
   - Install required packages: `pip install -r Backend/requirements.txt` (if applicable)

2. **Start the Backend**:
   - Run the startup script from the project root:
     ```bash
     python Backend/run_backend.py
     ```
   - The API will be available at `http://127.0.0.1:8000`

3. **Open the Frontend**:
   - Open `index.html` in your web browser.

4. **Seed Admin (Optional)**:
   - If you need to create the default admin account:
     ```bash
     python Backend/seed_admin.py
     ```

## 📂 Project Structure

- `Backend/`: Server-side FastAPI application, models, and utility scripts.
- `Frontend/`: All HTML, CSS, and JS files for users, providers, and admins.
- `.env`: Environment variables and database connection strings.
- `api/`: Vercel/Netlify serverless function entry points.
