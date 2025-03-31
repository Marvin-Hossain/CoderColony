# MindVoyager

A full-stack application to help job seekers track applications and practice interview questions with AI assistance.

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
git clone https://github.com/yourusername/MindVoyager.git
cd MindVoyager
```

### 2. Database Setup
1. Install PostgreSQL
2. Create a database named `mindvoyager`
3. Note your database username and password

### 3. Backend Configuration
1. Create `application-dev.properties` in `src/main/resources`:
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/mindvoyager
spring.datasource.username=your_username
spring.datasource.password=your_password

# Hibernate Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# OpenAI Configuration
openai.api.key=your_openai_api_key

# GitHub OAuth2 Configuration
spring.security.oauth2.client.registration.github.client-id=your_github_client_id
spring.security.oauth2.client.registration.github.client-secret=your_github_client_secret
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

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License
```
