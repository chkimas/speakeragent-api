# Podcast Matching Strategy: Semantic Intelligence vs. Keyword Search

## 1. Data Sourcing Strategy
To ensure high-quality leads, I propose a two-tiered sourcing approach:
* **Primary Source (Metadata):** Leverage the **Listen Notes API**. It provides structured data on "Listen Scores" (popularity), genres, and episode frequency.
* **Secondary Source (Context):** Use the **Podcast Index API** or a custom **Playwright-based scraper** to pull recent episode show notes. This allows the AI to understand the *actual* current conversation topics of the host, which metadata often misses.

## 2. Matching Methodology: The "Vector First" Approach
Traditional keyword matching (e.g., searching for "Security") is too broad. I will implement:
* **Embedding Generation:** Convert the speaker’s "Core Persona" and technical expertise into high-dimensional vectors using OpenAI's `text-embedding-3-small` or a similar model.
* **Semantic Similarity:** Use **pgvector** within a PostgreSQL database to perform a cosine similarity search. This matches a speaker who knows "Zero-Knowledge Proofs" to a podcast discussing "Advanced Cryptography" even if the keywords don't overlap.
* **Contextual Scoring:** A final pass using **Claude-3.5-Sonnet** to verify the "vibe" match. Does this speaker's tone (Technical/Deep-Dive) match the podcast's format (Conversational/General)?

## 3. Proposed Schema (Airtable/Database)
| Field | Type | Description |
| :--- | :--- | :--- |
| **Podcast Name** | String | Official title of the show. |
| **Match Score** | Number | 0-100 calculated via vector similarity. |
| **The "Why"** | Long Text | AI-generated reasoning for the match to show the user. |
| **Recent Relevant Episode** | URL | Link to the episode that triggered the match. |
| **Host Intent** | Select | Educational, Interview, Solo, Panel. |

## 4. Architecture Decisions
* **Async Processing:** Use **FastAPI's BackgroundTasks** for the initial scout. Matching 100+ podcasts against a persona is a heavy operation; the UI (Task 1) will poll for status while this runs in the background.
* **Validation Layer:** Implement a `verifier.py` agent (similar to the one in the existing `src/agent` folder) to prune low-quality matches before they reach the User Dashboard.