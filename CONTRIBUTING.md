# Contributing to LeaveScheduler

Thank you for your interest in contributing to LeaveScheduler! We welcome contributions from everyone who wants to help improve this leave scheduling application.

## How to Contribute

### Reporting Issues
- Check existing issues before creating a new one
- Use clear, descriptive titles (e.g., "Leave approval fails for manager role")
- Provide detailed reproduction steps
- Include relevant system information (OS, browser version, Java version, etc.)
- For UI issues, include screenshots when possible

### Pull Requests
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/leave-approval-workflow`)
3. Make your changes
4. Commit with clear messages (`git commit -m 'Add leave approval workflow for managers'`)
5. Push to your branch (`git push origin feature/leave-approval-workflow`)
6. Open a Pull Request

## Development Setup

### Prerequisites
- Java 11+ (for Spring Boot backend)
- Node.js 16+ (for React frontend)
- MySQL (for database)
- Maven (for Java dependencies)
- Homebrew (for macOS users to install MySQL)

### Environment Configuration

**Backend (.env file in `LeaveScheduler` directory):**
APP_JWT_SECRET=<YOUR_JWT_SECRET>
SPRING_DATASOURCE_USERNAME=<YOUR_H2_DB_USERNAME>
SPRING_DATASOURCE_PASSWORD=<YOUR_H2_DB_PASSWORD>
MYSQL_USERNAME=<YOUR_SQL_DB_USERNAME> 
MYSQL_PASSWORD=<YOUR_SQL_DB_PASSWORD>
MYSQL_URL=<YOUR_SQL_DB_URL> 
SPRING_MAIL_USERNAME=<YOUR_SMTP_ENABLED_MAIL_USERNAME>
SPRING_MAIL_PASSWORD=<YOUR_SMTP_ENABLED_MAIL_PASSWORD>


**Frontend (.env file in `leave-scheduler-frontend` directory):**
VITE_API_BASE_URL=<YOUR_BACKEND_HTTP_LINK_EG:http://localhost:8080>


### Quick Start
1. Clone the repository
2. Set up environment variables (create `.env` files as described above)
3. Run initial setup: `npm run init:all`
4. Start all services: `npm run start:all`
5. Open your browser to `http://localhost:5173`

### Manual Setup (if needed)
1. Install MySQL: `npm run init:mysql`
2. Build backend: `npm run init:backend`
3. Install frontend dependencies: `npm run init:frontend`
4. Start MySQL: `npm run start:mysql`
5. Start backend: `npm run start:backend`
6. Start frontend: `npm run start:frontend`

### Available Scripts
- `npm run init:all` - Complete initial setup
- `npm run start:all` - Start all services concurrently
- Individual service management scripts for MySQL, backend, and frontend

### Default Ports
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- MySQL: localhost:3306

## Code Standards
- **Backend (Java/Spring Boot):** Follow Java conventions and Spring Boot best practices
- **Frontend (React):** Follow React and JavaScript/TypeScript conventions
- Use meaningful variable and function names
- Write clear, readable code with proper indentation
- Include Javadoc for Java classes/methods and JSDoc for JavaScript functions
- Add comprehensive tests for leave management features
- Update API documentation for new endpoints
- Follow accessibility guidelines for UI components

## Testing
- **Backend:** Run `mvn test` in the LeaveScheduler directory
- **Frontend:** Run `npm test` in the leave-scheduler-frontend directory
- Add unit tests for new leave scheduling logic
- Add integration tests for leave approval workflows
- Test UI components with different screen sizes
- Ensure all tests pass and maintain code coverage

## Code Review Process
- All submissions require review from maintainers
- Maintainers will provide feedback within 48 hours
- Address feedback promptly and push updates
- Squash commits if requested for cleaner history

## Feature Requests
- Open an issue with the "enhancement" label
- Describe the leave management use case clearly
- Explain how it would benefit users
- Provide mockups or examples if applicable

## Getting Help
- Open an issue with the "question" label
- Check the project Wiki for development guides
- Review API documentation
- Reach out to maintainers via GitHub discussions

## Areas We Need Help
- Employee leave balance calculations
- Manager approval workflows
- Holiday calendar integrations
- Mobile responsiveness improvements
- Performance optimization for large organizations
- Accessibility enhancements
- Documentation and tutorials

## User Credentials for Testing
Before login, users should be registered. For Admin/Manager roles contact the admin. For dev testing use User Master (for credentials contact any of the repo owners).

## License
By contributing, you agree that your contributions will be licensed under the same license as this project.

Thank you for helping make LeaveScheduler better for everyone!
