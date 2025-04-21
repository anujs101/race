from flask import Flask, request, jsonify
from flask_cors import CORS

# === Import your notebook functions here ===
from enhancer import (
    flatten_json_resume,
    interpret_user_instruction,
    build_prompt,
    query_groq1,
    query_groq2,
    query_groq3,
    get_multiple_jobs_with_pagination,
    generate_cover_letter,
    get_parsed_resume
)

app = Flask(__name__)
CORS(app)

# === Endpoint 1: Enhance Resume ===
@app.route('/enhance_resume', methods=['POST'])
def enhance_resume():
    data = request.json
    resume_json = data.get('resume_json')
    user_instruction = data.get('user_instruction', '')

    if not resume_json:
        return jsonify({'error': 'resume_json is required'}), 400

    # Flatten and interpret resume
    resume_text = flatten_json_resume(resume_json)
    interpreted_prompt = interpret_user_instruction(resume_text, user_instruction)

    # Enhance via LLM
    enhanced_resume = query_groq1(interpreted_prompt)
    return jsonify({'enhanced_resume': enhanced_resume})


# === Endpoint 2: Get Jobs ===
@app.route('/get_jobs', methods=['POST'])
def get_jobs():
    data = request.json
    job_title = data.get('job_title')
    location = data.get('location', 'India')

    if not job_title:
        return jsonify({'error': 'job_title is required'}), 400

    jobs = get_multiple_jobs_with_pagination(job_title, location)
    return jsonify({'job_matches': jobs})


# === Endpoint 3: Generate Cover Letter ===
@app.route('/generate_cover_letter', methods=['POST'])
def generate_cl():
    data = request.json
    selected_job_title = data.get('selected_job_title')
    selected_job_description = data.get('selected_job_description')
    enhanced_resume = data.get('enhanced_resume')  # May come from frontend cache

    if not (selected_job_title and selected_job_description and enhanced_resume):
        return jsonify({'error': 'Missing required fields'}), 400

    cl = generate_cover_letter(
        resume_text=enhanced_resume,
        job_title=selected_job_title,
        job_description=selected_job_description
    )
    return jsonify({'cover_letter': cl})

@app.route('/parsed_resume', methods=['POST'])
def parsed_resume():
    data = request.json
    resume_text = data.get('resume_text')
    rag_context = data.get('rag_context', '')
    user_instruction = data.get('user_instruction', '')

    if not resume_text:
        return jsonify({'error': 'resume_text is required'}), 400

    parsed = get_parsed_resume(resume_text, rag_context, user_instruction)
    return jsonify({'parsed_resume': parsed})

@app.route('/')
def index():
    return jsonify({"message": "RACE Resume Enhancement API is up and running."})

def interpret_user_instruction(resume_text, user_instruction):
    """
    Enhances the prompt to allow interpretation of high-level user intent.
    Example: "Add project on AI chatbot" or "Explain my resume"
    """
    # Basic interpretation logic
    prompt_instruction = ""
    if "explain" in user_instruction.lower():
        prompt_instruction += "\nPlease summarize the resume and provide a brief explanation for each section."
    elif "add" in user_instruction.lower():
        prompt_instruction += f"\nUser wants to add: {user_instruction}. Please include it logically in the enhanced resume."
    elif "remove" in user_instruction.lower():
        prompt_instruction += f"\nUser wants to remove: {user_instruction}. Update the resume accordingly."
    elif "only keep" in user_instruction.lower():
        prompt_instruction += f"\nUser wants to filter: {user_instruction}. Apply that to the resume content."
    else:
        prompt_instruction += f"\nUser instruction: {user_instruction}"

    return f"""
You are a resume enhancement AI.
From the following raw resume data, rewrite it into structured professional resume sections: About, Skills (categorized), Experience, Education, Projects, Certifications, and Achievements.

{prompt_instruction}

Ensure the resume fits on one page. No explanations or extra text.

=== RESUME ===
{resume_text}

=== ENHANCED RESUME ===
"""

# Optional test code
if __name__ == "__main__":
    app.run(debug=True)
#     if __name__ == "__main__":
#     resume_text = "Sample resume..."
#     rag_context = "Top job descriptions..."
#     user_instruction = "Add my new certification"
    
#     prompt = build_prompt(resume_text, rag_context, user_instruction)
#     print(prompt)
