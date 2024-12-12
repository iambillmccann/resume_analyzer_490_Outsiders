from fastapi import FastAPI, File, Request, UploadFile, Form, HTTPException
from starlette.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime, timedelta
from dotenv import load_dotenv
import bcrypt
import jwt
import pdfplumber
import os
import os
import io
import docx
import re
from collections import Counter

#python3 -m uvicorn app:app --reload to run the api
#http://127.0.0.1:8000/docs for easy testing of the api - use try it out button

load_dotenv(dotenv_path="./backend/.env")
SECRET_KEY = os.getenv("JWT_SECRET_KEY")



class TextSubmission(BaseModel):
    text: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow frontend's origin (React app)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

users = []

@app.get("/")
def read_root():
    return {"Hello": "World"}
    return {"Hello": "World"}

@app.get("/api")
def read_api():
    return {"Hello": "API"}

@app.get("/dashboard")
async def dashboard(token: str):
    return {"message": f"Welcome to the dashboard"}


@app.post("/api/register")
async def register(request: Request):
    json_payload = await request.json()
    email = json_payload.get("email")
    for user in users:
        if user['email'] == email:
            return {"message": "Email already registered, please sign in"}
            return {"message": "Email already registered, please sign in"}
    password = json_payload.get("password")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

    newUser = {
        "email": email,
        "password": hashed_password,
        "username": json_payload.get("username"),
        "username": json_payload.get("username"),
    }

    users.append(newUser)

    return {"message": "User registered successfully"}

def jwt_generator(username):
    expiration = datetime.now() + timedelta(hours=3)
    print(username)
    token = jwt.encode(
        {"sub": username, "exp": expiration},
        SECRET_KEY,
        algorithm="HS256",
    )
    return token


def jwt_generator(username):
    expiration = datetime.now() + timedelta(hours=3)
    print(username)
    token = jwt.encode(
        {"sub": username, "exp": expiration},
        SECRET_KEY,
        algorithm="HS256",
    )
    return token


@app.post("/api/login")
async def login(request: Request):
    json_payload = await request.json()
    print(users)
    email = json_payload.get("email")
    password = json_payload.get("password")
    for user in users:
        if user['email'] == email:
            if bcrypt.checkpw(password.encode('utf-8'), user['password']):
                token = jwt_generator(user['username'])
                token = jwt_generator(user['username'])
                return {"message": "Login successful", "token": token}
            else:
                return {"message": "Invalid password"}
    return {"message": "User not found"}

@app.post("/api/resume-upload")
async def resumeUpload(file: UploadFile = File(...)):
    print("did we hit this endpoint")
    # Check if the uploaded file is a PDF
    if file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOCX files are accepted.")


    try:
        # Read the uploaded file content into memory
        file_content = await file.read()

        # Extract text from the PDF or DOCX stored in memory
        if file.content_type == "application/pdf":
            extracted_text = extract_text_from_pdf_in_memory(file_content)
        elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            extracted_text = extract_text_from_docx_in_memory(file_content)


        print(extracted_text)

        return {
            "message": "Resume uploaded and processed successfully.",
            "extracted_text": extracted_text[:5000]  # Limit response to 5000 characters for brevity
        }
    except Exception as e:
        print(f"An error occurred: {str(e)}");
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/api/job-description")
async def descriptionUpload(submission: TextSubmission):
    """
    Endpoint to submit resume text directly.
    Validates that the text is not empty and meets a minimum length requirement.
    """
    if not submission.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty or only whitespace."
        )
    
    if len(submission.text) > 5000:  # Example: Require at least 50 characters
        raise HTTPException(
            status_code=400,
            detail="Job description exceeds character limit."
        )
    
    return JSONResponse(
        content={"message": "Text submitted successfully", "character_count": len(submission.text)}
    )


def extract_text_from_pdf_in_memory(file_content: bytes) -> str:
    """
    Extract text from a PDF file stored in memory.

    Args:
        file_content (bytes): The binary content of the PDF file.

    Returns:
        str: Extracted text from the PDF file.
    """
    with pdfplumber.open(io.BytesIO(file_content)) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def extract_text_from_docx_in_memory(file_content: bytes) -> str:
    """
    Extract text from a DOCX file stored in memory.

    Args:
        file_content (bytes): The binary content of the DOCX file.

    Returns:
        str: Extracted text from the DOCX file.
    """
    doc = docx.Document(io.BytesIO(file_content))
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text


def calculate_fit_score(resume_text, job_description):
    # Tokenize and normalize text
    def tokenize(text):
        return re.findall(r'\b\w+\b', text.lower())

    resume_tokens = tokenize(resume_text)
    job_tokens = tokenize(job_description)

    # Count matching keywords
    resume_counter = Counter(resume_tokens)
    job_counter = Counter(job_tokens)

    matches = sum((resume_counter & job_counter).values())
    total_keywords = len(job_tokens)

    return int((matches / total_keywords) * 100) if total_keywords > 0 else 0

@app.post("/api/calculate-fit-score")
async def calculate_fit_score_endpoint(
    resume_text: str = Form(...), 
    job_description: str = Form(...)
):
    """
    API endpoint to calculate a fit score between a resume and job description.
    Args:
        resume_text (str): Text extracted from the resume.
        job_description (str): Text provided for the job description.
    Returns:
        JSONResponse: Fit score and message.
    """
    if not resume_text.strip() or not job_description.strip():
        raise HTTPException(
            status_code=400, 
            detail="Both resume text and job description must be provided."
        )

    try:
        fit_score = calculate_fit_score(resume_text, job_description)
        return JSONResponse(
            content={
                "message": "Fit score calculated successfully.",
                "fit_score": fit_score
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred during fit score calculation: {str(e)}"
        )