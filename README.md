Smartmatch FAQ Bot - Full Application Documentation
This repository houses an intelligent, production-ready conversational support assistant developed as part of the Code Alpha Artificial Intelligence Internship Program. The application combines a modern user interface with a robust, cloud-to-local hybrid intelligence architecture to surface precise answers from a pre-configured database or general artificial intelligence pipelines.

⚙️ Core Architecture & End-to-End Data Flow
The application processes user queries through a multi-tiered validation pipeline designed to optimize performance, minimize latency, and guarantee fallback reliability:

User Input & Initial State Mutation: When a user types a message and submits it, the application immediately updates the conversational state to display the user's message with a timestamp. Concurrently, an asynchronous typing indicator state is flipped to true, which renders animated CSS typing dots to signal background processing.
Primary Route Execution (Cloud GenAI Layer): The input query is passed directly to the getFaqMatch function. This function compiles the entire localized FAQ dataset into a compact JSON configuration layout string and appends it to the user's query context. It then sends a structured request payload to the gemini-3-flash-preview core execution engine via the native Google Gen AI SDK.
Semantic Mapping & System Instruction Verification: The cloud model evaluates the intent of the input against the dataset using detailed system instructions. It is strictly constrained to output a standardized JSON schema containing four fields: a matching question from the dataset, an answer string, a calculated confidence score, and an array of contextual related questions.
Confidence Score Processing Thresholds: If the model reports a confidence level 
≥
0.75
, the application displays the corresponding verified answer from the trusted database. If the incoming prompt falls entirely outside the scope of the pre-configured dataset (scoring below 
0.75
), the system leverages the model's broader general-intelligence capabilities to synthesize an accurate, informative reply so that the user is never met with a dead end.
Secondary Route Execution (Algorithmic Local Fallback Layer): If a network boundary failure occurs, API limits are exceeded, or an API key is missing, a try-catch safety net intercepts the error and diverts execution to an offline processing route.
Tokenization & Processing: The local route maps text patterns using the compromise NLP library, converting characters to lowercase and stripping out non-alphanumeric punctuation marks.
Semantic Noise Filtering: The system passes tokens through a localized static hash set of standard English STOPWORDS to filter out non-informative elements (such as "the", "with", "for", and "and").
Vector Geometry & Cosine Similarity Matrix: It generates structural keyword frequency maps for both the query and the target database entries. It then calculates a mathematical dot product divided by the product of their geometric vector magnitudes to generate a local similarity match percentage.
UI Timeline Resolution: Once the answer and suggestions arrays are computed (via cloud or local fallbacks), the system appends the payload data to the message timeline array. The UI uses a document pointer reference to trigger an automatic scroll behavior, bringing the new elements directly into the reader's view.
🛠️ Technical Stack Summary
Front-End Architecture: React 19 (TypeScript) leveraging component state hooks for reactive layout orchestration.
Build System & Environment Tooling: Vite v6 supplying optimal hot-module reloading and secured client-side environment wrapping.
Artificial Intelligence Core: Google Gen AI Native SDK interacting with the advanced gemini-3-flash-preview core execution engine.
Natural Language Processing (NLP): Compromise NLP library for local text tokenization and linguistic phrase parsing.
Styling Framework: Tailwind CSS v4 paired with Lucide React for modern, component-isolated visual design.
Animation Core Engine: Motion Framework (Framer Motion v12) handling micro-interactions and asynchronous layout states.
📂 Deep-Dive File & Codebase Explanation
1. Intelligence Pipeline Core (src/lib/nlp.ts)
This module houses the logical backbone of the assistant, managing text preprocessing and multi-layer fallback evaluation:

The Cloud Connection: Connects directly with the native Google Gen AI framework by parsing environment variables stored at build-time. It groups text inquiries and enforces strict, schema-conforming JSON model parameters during cloud code executions.
Local Mathematical Models: Contains the complete algorithmic framework for localized processing, specifying token matching logic, stopword maps, vector tracking objects, and dot-product vector geometry functions to handle standalone queries gracefully.
2. Layout View & Interactive State Core (src/App.tsx)
This file dictates UI states, asynchronous updates, layout effects, and interactive animations:

Thread History Management: Handles arrays tracking individual dialogue components, user roles, specific match tracking records, and unique render keys.
Quick-Click Prompt Injection: Maps returning text suggestion arrays into interactive click elements. Clicking these arrays triggers an instant message routing operation, dispatching the selected prompt text through the ingestion loop without forcing manual typing.
Fluid Layout Transitions: Embeds standard elements within specialized animation wrappers (AnimatePresence and motion.div) to create smooth visual transitions when text blocks are added chronologically.
3. Structural Support Database (src/data/faqs.ts)
Acts as the central offline knowledge registry for the application's matching pipelines:

Strong Typing Rules: Standardizes data models by enforcing a TypeScript FAQItem template requiring properties for question text, answers, tags, and category labels.
Context Division Matrix: Organizes informational sets into clear fields (General, Technical, Account) so text engines can map thematic keywords directly to matching indices.
4. Build Configuration Matrix (vite.config.ts)
Environment Secure Injections: Maps server environment variables down to the client safely by parsing process.env.GEMINI_API_KEY into a stringified JSON definition.
Path Management Mapping: Sets custom resolution paths using aliases, preventing deep relative navigation syntax throughout the directory tree.
