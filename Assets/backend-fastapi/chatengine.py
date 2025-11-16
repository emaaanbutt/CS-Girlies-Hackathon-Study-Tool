from langchain_huggingface import HuggingFaceEndpoint
from langchain.chains import ConversationalRetrievalChain
from dotenv import load_dotenv
import os
from langchain.chat_models import ChatOpenAI
# Load environment variables
load_dotenv()
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
def get_qa_chain(retriever):
    # Use the HuggingFaceEndpoint (recommended over deprecated HuggingFaceHub)
    # llm_model = HuggingFaceEndpoint(
    #     endpoint_url="https://api-inference.huggingface.co/models/google/flan-t5-base",
    #     headers={"Authorization": f"Bearer {HF_TOKEN}"},
    #     temperature=0,          # explicit parameter
    #     max_new_tokens=256      # explicit parameter
    # )

    llm_model = ChatOpenAI(
        model_name="gpt-3.5-turbo",  # or "gpt-4" if you have access
        temperature=0,
        openai_api_key=OPENAI_API_KEY
    )

    chain = ConversationalRetrievalChain.from_llm(
        llm=llm_model,
        retriever=retriever,
        chain_type="stuff",
        return_source_documents=True,
    )
    return chain
