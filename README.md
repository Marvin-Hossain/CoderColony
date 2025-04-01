# JobHuntHub

A full-stack application to help job seekers track applications and practice interview questions with AI assistance. This project demonstrates full-stack development skills with Java/Spring Boot and React/TypeScript.

## Features
- Job application tracking with progress visualization
- AI-powered interview question practice (behavioral and technical)
- GitHub OAuth2 authentication
- Progress tracking and statistics
- Timezone-aware date handling

## Tech Stack
### Backend
- Java 17
- Spring Boot 3
- Spring Security with OAuth2
- PostgreSQL
- OpenAI GPT-4 Integration

### Frontend
- React
- TypeScript
- Bootstrap
- Chart.js

## Prerequisites
- Java 17 or higher
- Maven
- PostgreSQL
- Git
- Node.js and npm

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Marvin-Hossain/JobHuntHub.git
cd JobHuntHub
```

### 2. Database Setup
1. Install PostgreSQL
2. Create a database named `jobhunthub`
3. Note your database username and password

### 3. Backend Configuration
1. Copy `application-dev.properties.example` to `application-dev.properties` in the `src/main/resources` directory:
```bash
cp src/main/resources/application-dev.properties.example src/main/resources/application-dev.properties
```
2. Edit `application-dev.properties` and replace the placeholder values with your actual configuration:
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/jobhunthub
spring.datasource.username=your_db_username  # Replace with your actual database username
spring.datasource.password=your_db_password  # Replace with your actual database password

# Hibernate Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# OpenAI Configuration
openai.api.key=your_openai_api_key  # Replace with your actual OpenAI API key

# GitHub OAuth2 Configuration
spring.security.oauth2.client.registration.github.client-id=your_github_client_id  # Replace with your GitHub OAuth client ID
spring.security.oauth2.client.registration.github.client-secret=your_github_client_secret  # Replace with your GitHub OAuth client secret
spring.security.oauth2.client.registration.github.redirect-uri=http://localhost:8080/login/oauth2/code/github
spring.security.oauth2.client.registration.github.scope=user:email,read:user

# Development Settings
debug=true
logging.level.org.springframework.security=TRACE
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

### 5. Run the Application
1. Start the backend:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
2. Start the frontend (in a new terminal):
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## Development Notes
- Backend uses Chicago timezone by default (configurable in `application.properties`)
- All dates are stored in UTC and converted to local timezone
- API endpoints are protected with OAuth2 authentication
- Frontend runs on port 3000, backend on port 8080

## Security Notes
- Never commit `application-dev.properties` (contains sensitive data)
- Keep API keys and credentials secure
- Production deployments should use environment variables