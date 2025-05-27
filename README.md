# JobHuntHub
A full-stack application to help job seekers track applications and practice interview questions with AI assistance. This project demonstrates full-stack development skills with Java/Spring Boot and React/TypeScript.

## Features
- Job application tracking with progress visualization
- AI-powered interview question practice
- GitHub OAuth2 and Google OIDC authentication
- Progress tracking and statistics

## Project Status
**Actively Under Development:** This project is currently in progress. Core features like job tracking and AI interview practice are functional, demonstrating the core full-stack architecture. Ongoing development focuses on UI refinement, usability improvements, and expanding test coverage across the application.

## Tech Stack
### Backend
- Java 23
- Spring Boot 3
- Spring Security with OAuth2
- H2 (for local development), PostgreSQL (for production)
- OpenAI GPT-4 Integration

### Frontend
- React
- TypeScript
- Bootstrap
- Chart.js

## Testing Strategy
This project prioritizes code quality and reliability through testing:

*   **Backend:** Comprehensive unit and integration tests cover service logic, repository interactions, and API endpoints (using JUnit and Mockito/Spring Test), ensuring backend stability.
*   **Frontend:** Unit tests for individual React components are implemented using Vitest/React Testing Library, verifying component logic and rendering accuracy.
*   **Ongoing Work:** Currently expanding test coverage with frontend integration tests and exploring end-to-end (E2E) testing strategies (e.g., using Cypress or Playwright) to validate key user flows across the application.

## Prerequisites
- Java 23 (Temurin JDK 23 recommended)
- Maven (usually bundled with IDEs or installable)
- Git
- Node.js 22.x or higher and npm (for frontend development)

## Getting Started (Local Development)
This project is configured for an easy local backend setup, allowing you to focus on frontend development. The backend uses an H2 in-memory database by default for local runs, so no external database installation is required.

### 1. Clone the Repository
```bash
git clone https://github.com/Marvin-Hossain/JobHuntHub.git
cd JobHuntHub
```

### 2. Backend Configuration (One-Time IDE Setup for Secrets)
The backend requires a few secrets for local development, primarily for GitHub OAuth OR Google OIDC login to function (whichever you would prefer to sign in with). These are **not** stored in the repository and must be configured as environment variables within your IDE's run configuration.

*   **Obtain Credentials:**
    *   The necessary GitHub OAuth credentials (`GITHUB_LOCAL_CLIENT_ID` and `GITHUB_LOCAL_CLIENT_SECRET`) or Google OIDC credentials (`GOOGLE_LOCAL_CLIENT_ID` and `GOOGLE_LOCAL_CLIENT_SECRET`) will be securely provided to you by the project maintainer (Marvin). These are for a shared development-only GitHub / Google OAuth application.
*   **Configure Your IDE:**
    1.  Open the `JobHuntHub` backend project in your IDE (e.g., IntelliJ IDEA, VS Code with Java extensions, Eclipse).
    2.  Edit the **Run/Debug Configuration** for the main Spring Boot application (usually named `JobHuntHubApplication` or similar).
    3.  In the configuration settings, find the section for **Environment Variables**.
    4.  Add the following environment variables:
        *   `GITHUB_LOCAL_CLIENT_ID`: Set this to the GitHub Client ID provided to you.
        *   `GITHUB_LOCAL_CLIENT_SECRET`: Set this to the GitHub Client Secret provided to you.
        *    (Optional) `GOOGLE_LOCAL_CLIENT_ID`: Set this to the Google Client ID provided to you.
        *   (Optional) `GOOGLE_LOCAL_CLIENT_SECRET`: Set this to the Google Client Secret provided to you.
        *   (Optional) `OPENAI_LOCAL_API_KEY`: If you wish to test the AI interview question evaluation feature, set this to your personal OpenAI API key. If not set, AI features will be disabled or provide a mocked response.
    5.  Save the Run/Debug Configuration.

### 3. Run the Backend
*   Run the `JobHuntHubApplication` main class from your IDE using the configuration you just modified.
*   The backend will start, typically on `http://localhost:8080`.
*   An H2 in-memory database is used automatically. You can access its web console (if needed for debugging) at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:jobhunthubdb`, User: `sa`, Password: `password`).

### 4. Frontend Setup
If you are also running the frontend locally:
```bash
cd frontend
npm install
npm run dev
```

The application will typically be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080` (The frontend is configured to talk to this)

## Development Notes
- The backend uses an H2 in-memory database by default for local development. Data will be cleared on each restart.
- The backend is configured to use Chicago timezone by default (see `app.timezone` in `application.properties`).
- All dates are stored in UTC and converted to the local timezone as needed.
- API endpoints are protected with OAuth2 authentication. GitHub login should work out-of-the-box after configuring the IDE environment variables.

## Security Notes
- **Never commit API keys, client secrets, or other sensitive credentials to the Git repository.**
- Local development secrets are managed via IDE environment variables as described above.
- Production deployments use a separate configuration (`application-prod.properties`) and securely managed environment variables (e.g., via GitHub Actions Secrets and AWS Elastic Beanstalk configuration).