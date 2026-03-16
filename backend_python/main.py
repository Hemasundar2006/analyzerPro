from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import re
import math

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_metadata(text):
    metadata = {
        "fullName": "N/A",
        "rollNumber": "N/A",
        "registration": "N/A",
        "community": "N/A",
        "subject": "N/A",
        "testCentre": "N/A",
        "examDate": "N/A",
        "shiftTime": "N/A"
    }
    
    # Precise patterns based on RRB Table Structure (from user screenshot)
    # The labels appear on one side, values on the other.
    # In text extraction, they often appear as "Label Value" or "Label\nValue"
    metadata_map = {
        "registration": r"Registration Number\s+(F\d+)",
        "rollNumber": r"Roll Number\s+(\d+)",
        "fullName": r"Candidate Name\s+([A-Z\s]+)",
        "community": r"Community\s+([A-Z\s]+)",
        "testCentre": r"Test Center Name\s+(.*)",
        "examDate": r"Test Date\s+(\d{2}/\d{2}/\d{4})",
        "shiftTime": r"Test Time\s+(\d{1,2}:\d{2}\s*[AMP\s\-]+[\d\:\sAMP]+)",
        "subject": r"Subject\s+(.*)"
    }
    
    first_page_text = text[:5000] # Usually in the first page
    
    for key, pattern in metadata_map.items():
        match = re.search(pattern, first_page_text, re.IGNORECASE)
        if match:
            val = match.group(1).split('\n')[0].strip()
            metadata[key] = val
        else:
            # Fallback to more generic search if exact label+value fails
            generic_label = key.replace("fullName", "Name").replace("testCentre", "Center").replace("shiftTime", "Time")
            fallback_pattern = rf"{generic_label}.*?[:\- ]\s*(.*)"
            match = re.search(fallback_pattern, first_page_text, re.IGNORECASE)
            if match:
                metadata[key] = match.group(1).split('\n')[0].strip()
            
    return metadata

def parse_question_blocks(text):
    # Split by Q. or Question ID
    blocks = re.split(r"(?=Q\.\s*\d+|Question\s*ID\s*[: ]*\d+)", text, flags=re.IGNORECASE)
    processed_questions = []
    
    # Precise Option Mapping
    opt_map = {
        "1": "A", "2": "B", "3": "C", "4": "D",
        "A": "A", "B": "B", "C": "C", "D": "D",
        "8": "B", "5": "A", "0": "D", "6": "C" 
    }
    
    for block in blocks:
        if not block.strip() or len(block) < 30: continue
            
        # 1. Question Number
        q_num = "Unknown"
        q_match = re.search(r"(?:Q\.\s*|Question\s*ID\s*[: ]*)(\d+)", block, re.IGNORECASE)
        if q_match: q_num = q_match.group(1)
        
        # 2. Correct Answer (Find Tick/Checkmark)
        correct_ans = "N/A"
        # Search for tick symbol followed by a number 1-4 or letter A-D
        # Using a wider search around the tick
        tick_match = re.search(r"([☑✔✓✅])\s*([1-4A-D850])", block)
        if not tick_match:
             tick_match = re.search(r"([1-4A-D850])\s*([☑✔✓✅])", block)
             
        if tick_match:
             # Extract the numeric or letter value
             raw_val = next((g for g in tick_match.groups() if g.upper() in opt_map), "N/A")
             correct_ans = opt_map.get(raw_val.upper(), "N/A")

        # 3. Candidate Choice
        chosen_opt = "N/A"
        status = "Not Answered"
        
        # Status check
        status_match = re.search(r"Status\s*[: ]*(Answered|Not Answered|Not Attempted|Marked)", block, re.IGNORECASE)
        if status_match: status = status_match.group(1).strip()
        
        # Choice check
        choice_match = re.search(r"Chosen Option\s*[: ]*([1-4A-D]|--|\d)", block, re.IGNORECASE)
        if choice_match:
            raw_choice = choice_match.group(1).upper()
            chosen_opt = opt_map.get(raw_choice, "N/A")
            if raw_choice == "--": chosen_opt = "N/A"
            
        # Final Verification: If status is Answered but chosen is N/A, try harder
        if "Answered" in status and chosen_opt == "N/A":
             # Sometimes the choice is just a lone number at the end of the metadata block
             lone_choice = re.search(r"Chosen Option\s*[: ]*\n\s*([1-4])", block)
             if lone_choice: chosen_opt = opt_map.get(lone_choice.group(1), "N/A")

        processed_questions.append({
            "qNum": q_num,
            "correctAnswer": correct_ans,
            "chosenOption": chosen_opt,
            "status": status
        })
        
    return processed_questions

@app.post("/api/parse-exam")
async def parse_exam(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        contents = await file.read()
        doc = fitz.open(stream=contents, filetype="pdf")
        full_text = ""
        for page in doc:
             # Use "dict" mode for better structural awareness if "text" is messy
             full_text += page.get_text() + "\n"

        # 1. Extract Details
        metadata = extract_metadata(full_text)
        
        # 2. Extract Questions
        questions = parse_question_blocks(full_text)
        
        # 3. Analyze
        # Only count blocks that look like valid questions (have a correct answer or valid number)
        valid_qs = [q for q in questions if q["correctAnswer"] != "N/A"]
        if len(valid_qs) < 10: valid_qs = [q for q in questions if q["qNum"] != "Unknown"]
        
        # Important: Sync total questions to 100 if it's an RRB exam
        total_q = len(valid_qs)
        
        attempted_qs = [q for q in valid_qs if q["chosenOption"] in ["A", "B", "C", "D"]]
        attempted = len(attempted_qs)
        correct = sum(1 for q in attempted_qs if q["chosenOption"] == q["correctAnswer"])
        incorrect = attempted - correct
        unattempted = total_q - attempted
        
        pos_marks = correct * 1.0
        neg_marks = incorrect * (1.0/3.0)
        score = pos_marks - neg_marks
        
        # Debug Log Output
        print(f"DEBUG: Name={metadata['fullName']}, Correct={correct}, Attempted={attempted}")

        return {
            "metadata": metadata,
            "stats": {
                "totalQuestions": total_q,
                "attempted": attempted,
                "correct": correct,
                "incorrect": incorrect,
                "unattempted": unattempted,
                "positiveMarks": round(pos_marks, 2),
                "penalty": round(neg_marks, 2),
                "finalScore": round(score, 2),
                "accuracy": round(correct/attempted*100 if attempted > 0 else 0, 2),
                "penaltyImpact": round(neg_marks/pos_marks*100 if pos_marks > 0 else 0, 2),
                "unattemptedList": [q["qNum"] for q in valid_qs if q["chosenOption"] == "N/A"][:14]
            }
        }
    except Exception as e:
        print(f"CRITICAL ERROR during PDF parsing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
