from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from utils import load_documents, load_urls, splitter
from vectorstore import build_vectorstore_from_docs
from chatengine import get_qa_chain
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEndpoint
# Load environment variables
load_dotenv()
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
from langchain_community.llms import HuggingFaceHub
from langchain.chat_models import ChatOpenAI
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str

# In-memory session
SESSION = {
    "retriever": None,
    "chain": None,
    "history": [],
}

# ------------------------------
# BUILD INDEX (FILES + URLS)
# ------------------------------
@app.post("/build-index")
async def build_index(files: list[UploadFile] = File(None), url: str = Form(None)):
    docs = []

    if files:
        for file in files:
            filename = file.filename
            with open(filename, "wb") as f:
                f.write(await file.read())
            docs.extend(load_documents(open(filename, "rb")))

    if url:
        url_list = [u.strip() for u in url.split(',') if u.strip()]
        for u in url_list:
            try:
                docs.extend(load_urls(u))
            except Exception:
                pass

    if not docs:
        return {"message": "No valid documents or URLs found"}

    split_docs = splitter(docs)
    retriever = build_vectorstore_from_docs(split_docs)
    chain = get_qa_chain(retriever)

    SESSION["retriever"] = retriever
    SESSION["chain"] = chain
    SESSION["history"] = []

    return {"message": "Index built successfully!"}

# ------------------------------
# CHAT ENDPOINT
# ------------------------------
@app.post("/chat")
async def chat(req: ChatRequest):
    user_query = req.question

    if SESSION.get("chain"):
        # Use retrieval-augmented chain
        result = SESSION["chain"].invoke(
            {"question": user_query, "chat_history": SESSION["history"]}
        )
        SESSION["history"].append((user_query, result["answer"]))
        return {"answer": result["answer"]}

    # Fallback: direct Hugging Face Flan-T5
    # llm_model = HuggingFaceEndpoint(
    #     endpoint_url="https://api-inference.huggingface.co/models/google/flan-t5-base",
    #     headers={"Authorization": f"Bearer {HF_TOKEN}"},
    #     temperature= 0, 
    #     max_new_tokens= 256

    # )
    llm_model = ChatOpenAI(
        model_name="gpt-3.5-turbo",  # or "gpt-4" if you have access
        temperature=0,
        openai_api_key=OPENAI_API_KEY
    )
    answer = llm_model.invoke(user_query)
    SESSION["history"].append((user_query, answer))
    return {"answer": answer}

# ------------------------------
# START SERVER
# ------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
