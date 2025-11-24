# docstream

> Streaming the latest documentation to developers through intelligent AI-powered conversations

**docstream** is a RAG (Retrieval Augmented Generation) chatbot application designed to help developers interact with technical documentation through natural conversations. Built as a senior capstone project, it leverages modern web technologies and AI to provide contextual, source-backed answers from documentation.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [System Components](#system-components)
- [Key Features Demonstrated](#key-features-demonstrated)
- [Documentation Processing Pipeline](#documentation-processing-pipeline)
- [Screenshots](#screenshots)

## ✨ Features

- **Intelligent Documentation Search**: Upload and index technical documentation from any source
- **Contextual AI Responses**: Get accurate answers backed by actual documentation sources
- **Multi-Document Support**: Attach multiple documentation sources to a single conversation
- **Real-time Streaming**: Experience smooth, token-by-token AI response streaming
- **Conversation History**: Maintain context across multiple messages
- **User Authentication**: Secure sign-in with email/password and social OAuth (GitHub, Google, X/Twitter)
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Documentation Management**: Easily manage and update your documentation library

## 🏗️ Architecture

docstream follows a modern full-stack architecture with clear separation between frontend, backend, database, and deployment layers:
<img width="5134" height="3938" alt="high-level-diagram" src="https://github.com/user-attachments/assets/2548227e-c670-41f3-a7f4-ae6edadceda6" />

### Key Architecture Decisions

1. **Separation of Concerns**: Frontend handles UI/UX while backend manages AI interactions and data processing
2. **Vector Database**: Pinecone stores document embeddings for fast semantic search
3. **Relational Database**: Supabase manages user data, chat history, and documentation metadata
4. **Streaming Responses**: Real-time token streaming provides better user experience
5. **Serverless Deployment**: Vercel (frontend) and Render (backend) for scalable hosting

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.2.1 (React 19)
- **Styling**: Tailwind CSS 4 with custom design system
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Authentication**: Supabase Auth with SSR
- **Type Safety**: TypeScript 5
- **State Management**: React Hooks and Server Actions

### Backend
- **Framework**: FastAPI (Python 3.11)
- **AI Model**: OpenAI GPT-4o-mini
- **Web Scraping**: Crawl4AI (0.4.248)
- **Document Processing**: 
  - BeautifulSoup4 for HTML parsing
  - Markdownify for HTML-to-Markdown conversion
  - LangChain text splitters for chunking
- **Embeddings**: OpenAI text-embedding-3-large
- **Dependency Management**: Poetry

### Databases & Services
- **Vector Database**: Pinecone (cosine similarity search)
- **Relational Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (optional)

### DevOps & Tools
- **Version Control**: Git
- **Package Management**: npm (frontend), Poetry (backend)
- **Deployment**: Vercel (frontend), Render (backend)
- **Environment Management**: dotenv

## 📁 Project Structure

```
docstream/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   │   ├── (auth)/      # Authentication routes
│   │   │   ├── (protected)/ # Protected chat routes
│   │   │   ├── (public)/    # Public pages
│   │   │   └── api/         # API routes
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Auth forms
│   │   │   ├── chat/        # Chat interface
│   │   │   ├── public/      # Landing page components
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   └── hooks/           # Custom React hooks
│   └── package.json
│
├── backend/                  # FastAPI application
│   ├── src/backend/
│   │   ├── indexing-chain/  # Documentation processing
│   │   │   ├── scraper.py   # Web scraping
│   │   │   ├── converter.py # HTML to Markdown
│   │   │   ├── splitter.py  # Document chunking
│   │   │   └── embedder.py  # Vector embeddings
│   │   ├── rag_chain/       # RAG implementation
│   │   │   └── rag_response.py
│   │   ├── models/          # Data models
│   │   ├── helpers/         # Helper utilities
│   │   └── main.py          # FastAPI entry point
│   ├── pyproject.toml
│   └── README.md
│
└── README.md                 # This file
```

## 🔧 System Components

### Documentation Processing Pipeline

The indexing pipeline transforms raw documentation into searchable vector embeddings:

1. **Scraping**: Crawl4AI fetches documentation from sitemaps
2. **Filtering**: BeautifulSoup removes navigation, headers, and non-content elements
3. **Conversion**: HTML is converted to clean Markdown format
4. **Splitting**: Documents are chunked using header-based and recursive splitting
5. **Embedding**: OpenAI generates 3072-dimensional embeddings
6. **Storage**: Vectors are stored in Pinecone with metadata

### RAG (Retrieval Augmented Generation) Flow

1. User submits a query with selected documentation sources
2. Query is embedded using OpenAI's embedding model
3. Pinecone performs cosine similarity search across selected namespaces
4. Top 5 most relevant chunks are retrieved
5. Context is injected into GPT-4o-mini prompt
6. Response streams back token-by-token to the user
7. Sources are cited when documentation was used

### Authentication Flow

- Email/password authentication via Supabase Auth
- OAuth integration with GitHub, Google, and X/Twitter
- Server-side session management using Supabase SSR
- Protected routes with middleware authentication checks

## 💡 Key Features Demonstrated

### 1. RAG Without RAG
Compare responses with and without documentation context:

**Without Documentation**

<img width="753" height="569" alt="claude_example_without_rag" src="https://github.com/user-attachments/assets/f5d363e3-ce1d-4083-992f-d9e8a3b6ec2d" />

- Generic response about Next.js 15
- No specific details or sources
- Outdated knowledge cutoff

**With Documentation**

<img width="846" height="964" alt="docstream-response" src="https://github.com/user-attachments/assets/b36bbe0e-ecaf-42a2-b48a-185f5da3788f" />

- Specific, accurate information about Next.js 15 features
- Source URLs cited
- Current information from official documentation

### 2. Smart Document Chunking

The splitter implements a sophisticated chunking strategy:

```python
def smart_split_markdown_document(
    markdown_document: MarkdownDocument,
    max_tokens: int = 600,
    min_tokens: int = 300,
    combine_small_chunks: bool = True
)
```

- Splits by headers (H1, H2, H3, H4) to preserve semantic structure
- Combines small chunks to reduce fragmentation
- Post-processes chunks exceeding token limits
- Maintains context within each chunk

### 3. Vector Search Implementation

**Pinecone Index Configuration**
<img width="812" height="300" alt="embeddings-pinecone-1" src="https://github.com/user-attachments/assets/ba4bce80-4485-491e-bf33-ee51337a0afc" />

- Metric: Cosine similarity
- Dimensions: 3072 (text-embedding-3-large)
- Dense vectors for fast similarity search
- Namespaced by embedding_id for efficient multi-document search

**Indexed Data Structure**
<img width="806" height="521" alt="embeddings-pinecone-2" src="https://github.com/user-attachments/assets/5974da0b-a215-4efa-af00-da8134c3bebc" />
Each vector includes:
- `chunk_index`: Position in original document
- `content`: The actual text chunk
- `documentation_id`: Source document reference
- `source_url`: Original documentation URL
- `token_count`: Chunk size for context management

### 4. Streaming Responses

The frontend implements real-time streaming for better UX:

```typescript
const streamResponse = async (currentMessages: Message[], currentDocs: Documentation[]) => {
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    body: JSON.stringify({
      chatHistory: currentMessages,
      chatDocumentations: currentDocs,
    }),
  });
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    setStreamedResponse(prev => prev + chunk);
  }
};
```

### 5. Documentation Management

Users can:
- Attach multiple documentation sources to a conversation
- Switch between different documentation sets per chat
- Search available documentation by name
- See which documentation sources are currently active

## 📸 Screenshots

### Chat Interface Comparison

**Without RAG** (Generic AI Response)
<img width="753" height="569" alt="claude-response" src="https://github.com/user-attachments/assets/e20320db-2c12-453a-ac02-6a829d973aea" />



**With RAG** (Documentation-Backed Response)
<img width="846" height="964" alt="docstream-response" src="https://github.com/user-attachments/assets/5b22358c-2dce-4cbe-aa9c-8d7e71b19aff" />

### Database Architecture

**Supabase Schema**

<img width="932" height="695" alt="database-schema-supabase" src="https://github.com/user-attachments/assets/2f0636ff-f79c-43b3-9369-2cad33a27c91" />

### Vector Embeddings

**Pinecone Index Overview**
<img width="812" height="300" alt="embeddings-pinecone-1" src="https://github.com/user-attachments/assets/a32d751d-79f2-4da2-a633-1bb92b19f29d" />


**Indexed Vector Data Example**
<img width="806" height="521" alt="embeddings-pinecone-2" src="https://github.com/user-attachments/assets/15a9e77e-ba21-4f18-b51a-ba93e783ac09" />


## 🎓 Learning Outcomes

This capstone project demonstrates proficiency in:

1. **Full-Stack Development**: End-to-end application development with modern frameworks
2. **AI/ML Integration**: Practical implementation of RAG architecture
3. **Vector Databases**: Understanding and utilizing semantic search
4. **System Design**: Architecting scalable, maintainable applications
5. **DevOps**: Deployment and environment management
6. **Database Design**: Relational and vector database modeling
7. **Authentication**: Secure user management with OAuth
8. **Real-time Systems**: Implementing streaming responses
9. **Document Processing**: NLP pipeline for text extraction and chunking
10. **API Design**: RESTful API development with FastAPI

## 📝 License

This project was created as a senior capstone project for educational purposes.

---

For questions or feedback about this project, please open an issue in the repository.
