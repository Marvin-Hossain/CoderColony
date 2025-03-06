Welcome to README! This will be updated overtime as changes are made.

mvnw & mvnw.cmd: Allow you to run maven commands. No need to modify

pom.xml: Maven build file. Update when adding dependencies (adding a new library). 
    Maven automatically takes care of building and managing dependencies via this file

target: Maven's compiled and packaged files. It's auto-generated, no need to interact.

.idea: Stores project's IDE settings. No need to interact directly.

.mvn: Holds Maven wrapper configurations. It's automatically managed, no need to interact.

resources/application.properties: Configuring Spring Boot application. Will need to interact
    to define things like database credentials, logging levels, etc.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Java 17 or higher
- Maven
- PostgreSQL
- Git

## Getting Started

Follow these steps to set up your development environment:

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/MindVoyager.git
cd MindVoyager
```

### 2. Create `application-dev.properties`

Create a file named `application-dev.properties` in the `src/main/resources` directory. Use the following template:

```properties
# application-dev.properties
# Development-only configuration
# DO NOT COMMIT THIS FILE TO GITHUB - add to .gitignore

# For local development only
openai.api.key=YOUR_API_KEY_HERE
openai.api.url=https://api.openai.com/v1/chat/completions

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/mindvoyager
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD

# Hibernate settings for development
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# GitHub Login
spring.security.oauth2.client.registration.github.client-id=YOUR_GITHUB_CLIENT_ID
spring.security.oauth2.client.registration.github.client-secret=YOUR_GITHUB_CLIENT_SECRET
spring.security.oauth2.client.registration.github.redirect-uri=http://localhost:8080/login/oauth2/code/github
spring.security.oauth2.client.registration.github.scope=user:email,read:user

# Debugging
debug=true
logging.level.org.springframework.security=TRACE

# Server Configuration
server.port=8080
```

### 3. Set Up Your Database

Make sure you have PostgreSQL installed and running. Create a database named `mindvoyager` and configure the username and password in your `application-dev.properties`.

### 4. Run the Application

To run the application in development mode, use the following command:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 5. Access the Application

Once the application is running, you can access it at `http://localhost:8080`.

## Environment Configuration

This application requires the following environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_API_URL`: OpenAI API endpoint (defaults to chat completions)

For local development:
1. Create a copy of `application.properties` named `application-dev.properties`
2. Add your development API keys
3. Run with the `dev` profile: `mvn spring-boot:run -Dspring-boot.run.profiles=dev`

⚠️ **IMPORTANT**: Never commit API keys or sensitive configuration to version control!

## Important Notes

- **Sensitive Information**: Ensure that your `application-dev.properties` file is added to `.gitignore` to prevent it from being committed to version control.
- **Environment Variables**: For production environments, consider using environment variables or a secure secrets management solution for sensitive information.

## Contributing

If you want to contribute to this project, please fork the repository and create a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
```
