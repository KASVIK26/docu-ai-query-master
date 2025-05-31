# Docu AI Query Master

**Docu AI Query Master** is a document-based question-answering system that leverages Retrieval-Augmented Generation (RAG) to provide intelligent responses from various document sources. Built with state-of-the-art NLP techniques and modern AI technologies, it offers a streamlined interface for extracting and querying information from multiple document formats.

## Features

- **Document Processing**: Upload and process documents in various formats.
- **Semantic Chunking**: Intelligent document chunking for optimal processing.
- **Vector Embedding Generation**: Utilizes advanced embedding models for text representation.
- **Hybrid Retrieval System**: Combines traditional and vector-based search for efficient information retrieval.
- **Context-Aware Q&A**: Leverages large language models to generate accurate responses based on document content.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS
- **Backend**: Node.js, Supabase
- **Embedding & LLM**: Normic for embeddings, Mistral for language model tasks

## Project Structure
docu-ai-query-master/
├── public/ # Static assets
├── src/ # Source code
├── supabase/ # Supabase configuration
├── index.html # Entry point
├── package.json # Project metadata and dependencies
├── tailwind.config.ts # Tailwind CSS configuration
├── tsconfig.json # TypeScript configuration
└── vite.config.ts # Vite build tool configuration
## Prerequisites

- **Node.js**: Ensure you have Node.js installed.
- **Supabase Account**: Set up a Supabase project for backend services.
- **API Keys**: Obtain necessary API keys for Normic and Mistral.

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/KASVIK26/docu-ai-query-master.git
   cd docu-ai-query-master
2. Install Dependencies:
   
   npm install
   
3. Configure Environment Variables:
   OPENAI_API_KEY = " " in Supabase Secrets.

4. Run the Application:
   npm run dev
   
##Usage
Upload Documents: Use the interface to upload documents you wish to query.

Ask Questions: Enter your questions related to the uploaded documents.

View Responses: The system will process your query and display relevant answers based on the document content.
   
 


![Screenshot 2025-06-01 001929](https://github.com/user-attachments/assets/c5d53017-6afe-4e73-bb63-2eff82fff4d2)
![Screenshot 2025-06-01 002010](https://github.com/user-attachments/assets/b5228399-b45a-47f4-9cd0-c4cd64e71ceb)
![Screenshot 2025-06-01 002019](https://github.com/user-attachments/assets/d4c9a5fc-73c0-42fc-9a4d-6b78c225881e)
![Screenshot 2025-06-01 002052](https://github.com/user-attachments/assets/9356429c-3a5d-49b4-8d61-b19ca78993b3)
![supabase-schema-bbgcmiocpqwyhshdbvzt](https://github.com/user-attachments/assets/128d283a-3aff-430f-a8f0-aa536c0bbba6)
