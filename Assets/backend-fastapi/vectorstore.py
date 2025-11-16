from langchain_huggingface import HuggingFaceEmbeddings  # Updated import
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings # type: ignore
from dotenv import load_dotenv
import os
from langchain.chat_models import ChatOpenAI
from langchain_openai import OpenAIEmbeddings

# Load environment variables from .env
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# Hugging Face token
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")
gemini_api_key= os.getenv('GEMINI_API_KEY')
def build_vectorstore_from_docs(docs):
    """
    Builds a FAISS vectorstore from a list of documents and returns a retriever.
    """
    # Use HuggingFaceEmbeddings with token in headers
    # embedding_model = HuggingFaceEmbeddings(
    #     model_name="sentence-transformers/all-mpnet-base-v2",
    #     headers={"Authorization": f"Bearer {HF_TOKEN}"}
    # )

    # embedding_model= GoogleGenerativeAIEmbeddings(
    # model="models/embedding-001",
    # google_api_key=gemini_api_key )

    embedding_model = OpenAIEmbeddings(
    model="text-embedding-3-large",  # or "text-embedding-3-small" for cheaper option
    openai_api_key=OPENAI_API_KEY
)

    # Split large documents into smaller chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    split_docs = splitter.split_documents(docs)

    # Build FAISS vectorstore
    db = FAISS.from_documents(split_docs, embedding_model)
    retriever = db.as_retriever(search_kwargs={"k": 5})

    return retriever
