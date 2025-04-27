from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle
import re
from tqdm.notebook import tqdm
import requests
from jinja2 import Environment, FileSystemLoader
import time
import serpapi
import json

model = SentenceTransformer("all-MiniLM-L6-v2")

ats_snippets = [
    "Use action verbs like 'Led', 'Managed', 'Developed', instead of passive phrases.",
    "Quantify your achievements, e.g., 'increased sales by 20%'.",
    "Keep resume length to one page unless you have 10+ years of experience.",
    "Tailor your resume to each job description by including relevant keywords.",
    "Use consistent formatting: bullet points, font size, spacing.",
    "Avoid vague terms like 'team player', focus on specific results.",
    "List technical skills and tools separately in a skills section.",
    "Start each bullet point with a powerful verb."
]

chunks = [chunk.strip() for chunk in ats_snippets if chunk.strip()]

embeddings = model.encode(chunks)
embeddings = np.array(embeddings).astype('float32')

index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

faiss.write_index(index, "cv_guide.index")
with open("cv_guide_texts.pkl", "wb") as f:
    pickle.dump(chunks, f)

def retrieve_cv_guidelines(query_text, top_k=3):
    query_embedding = model.encode([query_text]).astype("float32")
    index = faiss.read_index("cv_guide.index")
    with open("cv_guide_texts.pkl", "rb") as f:
        guide_chunks = pickle.load(f)

    distances, indices = index.search(query_embedding, top_k)
    return [guide_chunks[i] for i in indices[0]]

def flatten_resume_json(resume_json):
    classification = resume_json["data"]["classification"]
    parts = []

    # Contact Info
    contact = classification.get("contactInfo", {})
    parts.append(f"Name: {contact.get('name', '')}")
    parts.append(f"Email: {contact.get('email', '')}")
    parts.append(f"Phone: {contact.get('phone', '')}")
    parts.append(f"Address: {contact.get('address', '')}")
    parts.append(f"LinkedIn: {contact.get('linkedin', '')}")

    # Education
    education = classification.get("education", [])
    if education:
        parts.append("\nEducation:")
        for edu in education:
            parts.append(f"- {edu}")

    # Experience
    experience = classification.get("experience", [])
    if experience:
        parts.append("\nExperience:")
        for exp in experience:
            parts.append(f"- {exp['role']} at {exp['organization']} ({exp['duration']}): {exp['description']}")

    # Projects
    projects = classification.get("projects", [])
    if projects:
        parts.append("\nProjects:")
        for proj in projects:
            parts.append(f"- {proj['name']}: {proj['description']}")

    # Skills
    skills = classification.get("skills", [])
    if skills:
        parts.append("\nSkills: " + ", ".join(skills))

    # Certifications
    certs = classification.get("certifications", [])
    if certs:
        parts.append("\nCertifications:")
        for cert in certs:
            parts.append(f"- {cert}")

    # Achievements
    achievements = classification.get("achievements", [])
    if achievements:
        parts.append("\nAchievements:")
        for ach in achievements:
            parts.append(f"- {ach}")

    return "\n".join(parts)

def embed_resume_for_future_matching(resume_text):
    emb = model.encode([resume_text]).astype("float32")
    index = faiss.IndexFlatL2(emb.shape[1])
    index.add(emb)
    faiss.write_index(index, "resume_vectors.index")

def build_prompt(resume_json):
    resume_text = flatten_resume_json(resume_json)
    rag_context = retrieve_cv_guidelines(resume_text, top_k=3)
    embed_resume_for_future_matching(resume_text)

    return f"""
        You are a resume enhancement AI.

        From the following raw resume data and RAG context, extract and rewrite content into structured professional resume sections: About, Skills, Experience, Education, Projects, Certifications, and Achievements.

        Only return the enhanced resume content. Content should fit into a single page. Do NOT include any explanations, notes, or repeat the prompt.
        === RAG CONTEXT ===
        {rag_context}
        === Resume Input ===
        {resume_text}

        === Enhanced Resume ===
    """

def query_groq(prompt, model="llama3-8b-8192"):
    GROQ_API_KEY = "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"

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a resume enhancer AI. Output structured resume sections only."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 1024
    }

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]

def parse_enhanced_resume(resume_json):
    prompt = build_prompt(resume_json)
    raw_text = query_groq(prompt)

    metadata = resume_json["data"]["classification"]["contactInfo"]
    section_titles = [
        "About", "Skills", "Experience", "Education", "Projects",
        "Certifications", "Achievements"
    ]

    sections = {title.lower(): [] for title in section_titles}
    current_section = None

    lines = raw_text.strip().splitlines()
    for line in lines:
        # Detect section headers like **Skills**
        match = re.match(r"\*\*(.*?)\*\*", line.strip())
        if match:
            header = match.group(1).strip()
            if header in section_titles:
                current_section = header.lower()
                continue

        # Store content lines under the current section
        if current_section:
            content = line.strip("•").strip("-").strip()
            if content:
                sections[current_section].append(content)

    # Now build the final resume JSON
    def get_single_line(section_name):
        items = sections.get(section_name.lower(), [])
        return items[0] if items else ""

    def clean_items(items):
        if items is None:
            return []
        cleaned = []
        for item in items:
            item = item.lstrip('*+•- ').strip()
            cleaned.append(item)
        return cleaned

    parsed_resume = {
        "name": metadata.get("name", ""),
        "email": metadata.get("email", ""),
        "phone": metadata.get("phone", ""),
        "address": metadata.get("address", ""),
        "linkedin": metadata.get("linkedin", ""),
        "about": get_single_line("About"),
        "skills": clean_items(sections.get("skills", [])),
        "experience": clean_items(sections.get("experience", [])),
        "education": clean_items(sections.get("education", [])),
        "projects": clean_items(sections.get("projects", [])),
        "certifications": clean_items(sections.get("certifications", [])),
        "achievements": clean_items(sections.get("achievements", []))
    }

    return parsed_resume

def render_latex(resume_json, template_path="resume_template.tex"):
    resume_data = parse_enhanced_resume(resume_json)
    
    env = Environment(loader=FileSystemLoader('.'))
    template = env.get_template(template_path)
    latex_code =  template.render(resume_data)
    with open("resume_output.tex", "w", encoding="utf-8") as f:
        f.write(latex_code)
    return latex_code

def get_multiple_jobs_with_pagination(job_title, location):
    params = {
        "engine": "google_jobs",
        "q": job_title,
        "location": location,
        "api_key": '83c1ef3c99b32b05ab29da61937948e1cce626b355feb3c4c6ead197a08a7aac',
        "hl": "en",
        "gl": "in"
    }
    max_jobs = 5
    all_jobs = []
    next_page_token = None

    while len(all_jobs) < max_jobs:
        if next_page_token:
            params["next_page_token"] = next_page_token
        else:
            params.pop("next_page_token", None)

        search = serpapi.search(params)   # returns SerpResults (dict-like)
        data = search          

        jobs = data.get("jobs_results", [])
        all_jobs.extend(jobs)

        # Pagination
        serpapi_pagination = data.get("serpapi_pagination", {})
        next_page_token = serpapi_pagination.get("next_page_token")

        if not next_page_token:
            break

        time.sleep(1)

    all_jobs = all_jobs[:max_jobs]

    result = {}
    for idx, job in enumerate(all_jobs, 1):
        description = job.get('description', '')
        company_name = job.get('company_name', '')
        application_link = ""
        if 'apply_options' in job and job['apply_options']:
            application_link = job['apply_options'][0].get('link', '')
        elif 'via' in job:
            application_link = job['via']
        else:
            application_link = job.get('detected_extensions', {}).get('apply_link', '')
        
        actual_job_title = job.get('title', f"{job_title} Opportunity {idx}")
        result[actual_job_title] = {
            "company_name": company_name,
            "description": description,
            "application_link": application_link
        }

    return result

#-----------------Entry Point------------
def embed_job_data(job_title, location):
    job_descriptions_json = get_multiple_jobs_with_pagination(job_title, location)

    descriptions = []
    metadata = []

    for title, data in job_descriptions_json.items():
        description = data.get("description", "")
        descriptions.append(description)

        metadata.append({
            "title": title,
            "company_name": data.get("company_name", ""),
            "application_link": data.get("application_link", ""),
            "description": description  # 🔥 also saving description inside metadata now
        })

    # Step 4: Generate embeddings
    embeddings = model.encode(descriptions)
    embeddings_np = np.array(embeddings).astype("float32")  # FAISS requires float32

    # Step 5: Create FAISS index and add embeddings
    dimension = embeddings_np.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings_np)

    # Optional: Save FAISS index
    faiss.write_index(index, "job_faiss.index")

    # Step 6: Save metadata (with descriptions) for lookup
    with open("job_faiss_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

def match_jobs(resume_json):
    enhanced_resume = parse_enhanced_resume(resume_json)
    render_latex(resume_json)
    
    index = faiss.read_index("job_faiss.index")
    
    with open("job_faiss_metadata.json", "r") as f:
        metadata = json.load(f)
    
    resume_embedding = model.encode([enhanced_resume]).astype("float32")
    top_k = 3
    D, I = index.search(resume_embedding, top_k)
    
    matched_jobs = []

    for idx in I[0]:
        job = metadata[idx]
        matched_jobs.append({
            "title": job.get('title', ''),
            "company_name": job.get('company_name', ''),
            "application_link": job.get('application_link', '')
        })
    
    return json.dumps({"matched_jobs": matched_jobs}, indent=2)

#---------------------------Entry Point----------------------------
def generate_learning_path(resume_json) :
    enhanced_resume = parse_enhanced_resume(resume_json)
    job_desc = match_jobs(resume_json)
    rag_prompt = f"""
        You are a career advisor AI. The following is a candidate's resume:

        --- RESUME ---
        {enhanced_resume}

        These are the job descriptions of top matches:

        --- JOB DESCRIPTIONS ---
        {job_desc}

        1. Identify what technical or domain-specific skills the candidate is missing.
        2. Recommend a step-by-step learning path (with topics/tools/technologies) to bridge the gap.
        3. Suggest resources (platforms or certifications) for each skill if possible.
    """
    
    return query_groq(rag_prompt)

#----------------------------------------Entry Point----------------------------------------------
def generate_cover_letter(resume_json, selected_job_title, selected_job_description, company_name):
    enhance_resume = parse_enhanced_resume(resume_json)
    prompt = f"""
        Write a personalized and professional cover letter for the position of "{selected_job_title}" at {company_name}.
        The letter should be 3-4 paragraphs, tailored to the job description below, and should highlight how the candidate's skills align with the company's requirements.

        --- Candidate's Resume ---
        {enhance_resume}

        --- Job Description ---
        {selected_job_description}

        Ensure the tone is confident, enthusiastic, and formal. Avoid generic phrases. Mention specific skills or experiences from the resume that match the job. End with a call to action and interest in an interview.
        Begin your response directly from the actual response, no need to give headers like 'Here is your generated cover letter'.
    """

    return query_groq(prompt, model="llama3-8b-8192")