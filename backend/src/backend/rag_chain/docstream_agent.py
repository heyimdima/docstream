from dotenv import load_dotenv
import os, uuid
from openai import OpenAI
from pinecone import Pinecone
from backend.models.rag.models import Message, ChatDocumentation, SemanticMatch
from typing import List
from supabase import create_client, Client
import logfire

load_dotenv()

# Initialize Pinecone client
pinecone = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
# Initialize Pinecone index
index = pinecone.Index(name="documentations")

logfire.configure(send_to_logfire='if-token-present')

