from langchain.document_loaders import (
    TextLoader,
    CSVLoader,
    PyPDFLoader,
    WebBaseLoader,
    UnstructuredWordDocumentLoader
)
from pathlib import Path
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
import os
from langchain.chat_models import ChatOpenAI

# Load environment variables from .env file
load_dotenv()
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def load_documents(filepath):
    # Handle UploadFile object or string path
    filepath = getattr(filepath, 'name', filepath)
    extension = Path(filepath).suffix.lower()

    if extension == ".txt":
        docs = TextLoader(filepath).load()
    elif extension == ".pdf":
        docs = PyPDFLoader(filepath).load()
    elif extension == ".csv":
        docs = CSVLoader(filepath).load()
    elif extension == ".docx":
        docs = UnstructuredWordDocumentLoader(filepath).load()
    else:
        docs = []
    return docs


def load_urls(url):
    docs = WebBaseLoader(url).load()
    return docs


def splitter(docs):
    splitter_obj = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    split_docs = splitter_obj.split_documents(docs)
    return split_docs
