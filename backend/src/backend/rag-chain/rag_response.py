from dotenv import load_dotenv
import os, uuid
from openai import OpenAI
from pinecone import Pinecone

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client
chatgpt = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize Pinecone client
pinecone = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
# Initialize Pinecone index
index = pinecone.Index(
    name="documentations",
    pool_threads=50,
    connection_pool_maxsize=50
    )

def get_embedding(text, model="text-embedding-3-large"):
    return chatgpt.embeddings.create(input=[text], model=model).data[0].embedding

def search_pinecone(user_query: str, embedding_ids: list[str]):
    # Convert a list of embedding ids to a list of strings
    string_embedding_ids = [str(embedding_id) for embedding_id in embedding_ids]

    # Get embeddings for user query
    user_query_embedding = get_embedding(user_query)

    try:
        # Query Pinecone index
        search_result = index.query_namespaces(
            vector=user_query_embedding,
            namespaces=string_embedding_ids,
            metric="cosine",
            top_k=5,
            include_metadata=True
        )
        semantic_matches = []
        for match in search_result.matches:
            # Make sure all required metadata fields exist
            metadata = match.metadata
            semantic_match = SemanticMatch(
                pinecone_chunk_id=match.id,
                documentation_id=metadata.get("documentation_id", ""),
                content=metadata.get("content", ""),
                source_url=metadata.get("source_url", ""),
                tokens=metadata.get("tokens", 0),
                score=match.score
            )
            semantic_matches.append(semantic_match)

        # for match in semantic_matches:
        #     print(f"Match: {match.content} - Score: {match.score}")

        return semantic_matches
    except Exception as e:
        print(f"Error querying Pinecone index: {e}")
        # Return an empty list instead of an error string
        return []

def stream_chatgpt_response(user_query: str, matches: List[SemanticMatch]):
    system_prompt = """
    You are an AI assistant that answers questions based on provided documentation chunks.
    Use the given documentation chunks if relevant; otherwise, say no information was found.
    At the end, list the sources used. Your response should be in markdown format.
    """

    # Build a docs string from the matches
    if matches:
        docs = "\n\n".join([
            f"Source: {match.source_url}\nContent: {match.content}"
            for match in matches
        ])
    else:
        docs = "No relevant documentation found."

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "assistant", "content": f"Here are the relevant docs:\n{docs}"},
        {"role": "user", "content": f"Q: {user_query}"}
    ]

    stream = chatgpt.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        stream=True
    )

    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content
