# H5P Viewer Spring Boot Backend

This is the Spring Boot backend for the H5P content viewer application, which serves as a REST API for the React frontend.

## Features

- RESTful API for H5P content management
- JWT-based authentication
- Role-based access control (ADMIN and USER roles)
- User management
- Faculty and category management
- H5P content storage and retrieval

## Role-Based Access Control

The application now supports two roles:
- **USER**: Regular authenticated users who can view content and manage their profile
- **ADMIN**: Administrators who can manage users, content, and system settings

See [README-RBAC.md](./README-RBAC.md) for detailed information about the role-based access control implementation.

## Getting Started

### Prerequisites

- Java 21
- Maven
- MySQL 8.0+

### Running the Application

1. Clone the repository
2. Create a MySQL database named `h5p`
3. Update the database connection properties in `src/main/resources/application.properties` if needed
4. Build and run the application:

```bash
mvn spring-boot:run
```

The application will start on port 3500 by default.

### Initial Admin Setup

After starting the application for the first time, create an admin user using:

```
POST /api/admin/setup
{
  "email": "admin@example.com",
  "password": "secure_password",
  "secretKey": "initialSetupSecretKey123"
}
```

**Note:** Change the `secretKey` value in production.

## API Documentation

### Authentication

- `POST /api/auth/login` - Authenticate user and get JWT token
- `POST /api/auth/register` - Register new user

### User Management (Admin Only)

- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create regular user
- `POST /api/users/admin` - Create admin user
- `PUT /api/users/{id}/promote` - Promote user to admin
- `PUT /api/users/{id}/demote` - Remove admin role
- `PUT /api/users/{id}/activate` - Activate user
- `PUT /api/users/{id}/deactivate` - Deactivate user

### H5P Content

- `GET /api/h5p-contents` - Get all H5P contents
- `GET /api/h5p-contents/{id}` - Get H5P content by ID
- `POST /api/h5p-contents` - Create new H5P content
- `PUT /api/h5p-contents/{id}` - Update H5P content
- `DELETE /api/h5p-contents/{id}` - Delete H5P content

### Faculties and Categories

- `GET /api/faculties` - Get all faculties
- `GET /api/categories` - Get all categories

## Database Schema

See [user-role-schema.md](./docs/user-role-schema.md) for the database schema related to user and role management.

## Testing

Run the tests with:

```bash
mvn test
```

## Building

Build the application with:

```bash
mvn clean package
```

The JAR file will be created in the `target` directory.

## Deployment

The application can be deployed as a standalone JAR or in a Docker container.

### Docker Deployment

```bash
docker build -t h5p-viewer-backend .
docker run -p 3500:3500 h5p-viewer-backend
```
