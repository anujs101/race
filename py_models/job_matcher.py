import pdfplumber
from sentence_transformers import SentenceTransformer, util

def extract_resume_text(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text()
    return text

from serpapi import GoogleSearch

def fetch_jobs(query):
    params = {
        "engine": "google_jobs",
        "q": query,
        "api_key": "6af3fa3a79cb43f752988507c48f89fb1389814d3aa7a67641761ca218145d6e"
    }
    search = GoogleSearch(params)
    results = search.get_dict()
    return results['jobs_results']

job_listings = fetch_jobs("Machine Learning Jobs")
job_matches = []
for job in job_listings:
    job_text = job['title'] + ' ' + job['description']
resume_text = extract_resume_text("Naman Shah resume.pdf")

model = SentenceTransformer('all-MiniLM-L6-v2')
resume_embedding = model.encode(resume_text, convert_to_tensor=True)
job_embedding = model.encode(job_text, convert_to_tensor=True)
similarity = util.pytorch_cos_sim(resume_embedding, job_embedding)
job_matches.append((job, similarity.item()))

top_matches = sorted(job_matches, key=lambda x: x[1], reverse=True)[:5]