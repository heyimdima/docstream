# from dotenv import load_dotenv
# import os, uuid
# from typing import List
# from openai import OpenAI
# from pinecone import Pinecone
# from supabase import create_client, Client
# from backend.models.indexing.models import SplitMarkdownDocument
# from backend.helpers.tokenizer import count_tokens


# # Load environment variables from .env file
# load_dotenv()

# # Initialize OpenAI client
# chatgpt = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# # Initialize Pinecone client
# pinecone = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
# # Initialize Pinecone index
# index = pinecone.Index("documentations")

# # Initialize Supabase client
# url = os.getenv("SUPABASE_URL")
# key = os.getenv("SUPABASE_KEY")
# supabase: Client = create_client(str(url), str(key))

# def get_embedding(text, model="text-embedding-3-large"):
#     return chatgpt.embeddings.create(input = [text], model=model).data[0].embedding

# def upsert_chunks_to_pinecone(semantic_chunks):
#     # Get the documentation_id from the first chunk (all chunks have the same documentation_id)
#     if not semantic_chunks:
#         print("No chunks to process")
#         return None

#     documentation_id = str(semantic_chunks[0].documentation_id)

#     # Create a new unique embedding_id for this batch
#     embedding_id = str(uuid.uuid4())

#     # Get any existing embedding_id for this documentation
#     result = supabase.table("documentations") \
#         .select("embedding_id") \
#         .eq("id", documentation_id) \
#         .execute()

#     old_embedding_id = None
#     if result.data and len(result.data) > 0 and result.data[0].get('embedding_id'):
#         old_embedding_id = result.data[0]['embedding_id']
#         print(f"Found existing embedding_id: {old_embedding_id}")

#     # Process and upsert vectors to Pinecone
#     vectors = []
#     batch_size = 100

#     print(f"Processing {len(semantic_chunks)} semantic chunks for documentation_id: {documentation_id}")

#     for i, chunk in enumerate(semantic_chunks):
#         # Use the pinecone_chunk_id as the vector_id
#         vector_id = str(chunk.pinecone_chunk_id)

#         # Get embedding for the chunk content
#         embedding = get_embedding(chunk.content)

#         # Create vector for Pinecone with exactly the format we need
#         vector = {
#             "id": vector_id,
#             "values": embedding,
#             "metadata": {
#                 "documentation_id": str(chunk.documentation_id),
#                 "source_url": chunk.source_url,
#                 "chunk_index": chunk.chunk,
#                 "content": chunk.content,
#                 "token_count": chunk.tokens
#             }
#         }

#         vectors.append(vector)

#         # Batch upsert when we reach batch_size or at the end
#         if len(vectors) >= batch_size or i == len(semantic_chunks) - 1:
#             try:
#                 index.upsert(vectors=vectors, namespace=embedding_id)
#                 print(f"Upserted batch: {i-len(vectors)+1} to {i+1}")
#             except Exception as e:
#                 print(f"Error upserting to Pinecone: {str(e)}")

#             # Clear the batch
#             vectors = []

#     # Update the documentation record with the new embedding_id
#     try:
#         supabase.table("documentations").update({"embedding_id": embedding_id}) \
#             .eq("id", documentation_id) \
#             .execute()
#         print(f"Updated documentation record with new embedding_id: {embedding_id}")
#     except Exception as e:
#         print(f"Error updating documentation record: {str(e)}")

#     # Delete old vectors if they existed
#     if old_embedding_id:
#         try:
#             index.delete(namespace=old_embedding_id, delete_all=True)
#             print(f"Deleted old vectors with embedding_id: {old_embedding_id}")
#         except Exception as e:
#             print(f"Error deleting old vectors: {str(e)}")

#     return embedding_id
