# Jurifly :: Core Engine [v0.9.0-beta]

> "Talk is cheap. Show me the code." - Linus Torvalds

## System Overview

This repository contains the core frontend and AI orchestration layer for Jurifly. It's a monolithic Next.js application built on the App Router paradigm, leveraging React Server Components (RSC) for performance and Genkit for server-side AI flow management.

The system is designed for high-throughput interaction with Google's Gemini models, with a focus on structured data input/output via Zod schemas. State management is minimized on the client, favoring server-driven UI updates where possible.

---

## Tech Stack

-   **Framework:** Next.js 15.x (App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS with ShadCN UI components
-   **AI Orchestration:** Genkit (with Google AI plugin)
-   **Authentication:** Firebase Auth
-   **Database:** Firestore (as a user profile and light-data backend)
-   **Deployment:** Vercel / Firebase Hosting (compatible with both)

---

## Local Development Setup

### Prerequisites

-   Node.js >= 20.x
-   npm (or your package manager of choice)
-   A correctly configured `.env` file with necessary API keys (see `.env.example` if available).

### Installation & Execution

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    The application runs on two concurrent processes: the Next.js frontend and the Genkit AI server.

    ```bash
    # Run the Next.js frontend
    npm run dev

    # In a separate terminal, run the Genkit development server
    npm run genkit:watch
    ```

The Next.js app will be available at `http://localhost:3000`.
The Genkit development UI will be at `http://localhost:4000`.

---

## Project Architecture

-   `src/app/dashboard/`: Contains all the primary routes for the application dashboard. Follows the Next.js App Router conventions.
-   `src/components/`: Shared React components. UI components from ShadCN are in `src/components/ui`.
-   `src/hooks/`: Custom React hooks, primarily for authentication (`useAuth`) and device detection (`use-is-mobile`).
-   `src/lib/`: Utility functions, type definitions (`types.ts`), and Firebase configuration.
-   `src/ai/`: Core AI logic.
    -   `genkit.ts`: Initializes the global Genkit instance and configures the AI model.
    -   `flows/*.ts`: Contains all the Genkit flows. Each flow is a server-side function that orchestrates prompts, tools, and other logic to fulfill a specific AI task. **This is where most of the AI magic happens.**

---

## AI Flow Development

Genkit flows are the backbone of the AI functionality. A typical flow:
1.  Is defined in a file under `src/ai/flows/`.
2.  Uses `zod` to define strict input and output schemas. This is critical for reliable model interaction.
3.  Uses `ai.defineFlow(...)` to wrap the core logic.
4.  Often calls an `ai.definePrompt(...)` which contains the core instructions for the LLM.
5.  Is exported as a standard async server action that can be called from client components.

> **Note:** All flows are executed server-side. The client-side code only invokes these flows and handles the returned data or errors.

---

## Contributing

1.  Fork the repo.
2.  Create a new branch (`git checkout -b feature/your-awesome-feature`).
3.  Commit your changes (`git commit -m 'feat: Add some awesome feature'`).
4.  Don't break the main branch. Seriously.
5.  Push to the branch (`git push origin feature/your-awesome-feature`).
6.  Open a Pull Request. Provide a clear description of the "what" and "why".

---

### **Don't Panic.**
