# Role-Based Access Control Implementation

This document explains the implementation of role-based access control (RBAC) in the H5P Viewer Spring Boot application.

## Roles

The application has two main roles:

1. **USER**: Basic authenticated user who can view and interact with content
2. **ADMIN**: Administrator with additional privileges to manage users and content

## User Entity

The User entity has been updated to include:
- Roles (ADMIN, USER)
- Active status
- First and last name fields

## Security Implementation

### Spring Security Configuration
- Method-level security using `@EnableMethodSecurity` and `@PreAuthorize` annotations
- JWT token-based authentication
- Role-based authorities included in JWT tokens

### Controllers with Role-Based Access

1. **UserController**
   - GET `/api/users` - Get all users (ADMIN only)
   - GET `/api/users/{id}` - Get user by ID (ADMIN or self)
   - POST `/api/users` - Create user (ADMIN only)
   - POST `/api/users/admin` - Create admin user (ADMIN only)
   - PUT `/api/users/{id}/promote` - Promote to admin (ADMIN only)
   - PUT `/api/users/{id}/demote` - Remove admin role (ADMIN only)
   - PUT `/api/users/{id}/activate` - Activate user (ADMIN only)
   - PUT `/api/users/{id}/deactivate` - Deactivate user (ADMIN only)

2. **AdminController**
   - POST `/api/admin/setup` - Initial admin setup (secured by secret key)
   - POST `/api/admin/users/{userId}/promote` - Promote user to admin (ADMIN only)
   - POST `/api/admin/users/{userId}/demote` - Remove admin role (ADMIN only)
   - POST `/api/admin/users/{userId}/activate` - Activate user (ADMIN only)
   - POST `/api/admin/users/{userId}/deactivate` - Deactivate user (ADMIN only)

3. **AuthController**
   - POST `/api/auth/login` - Authenticate and get JWT with role info
   - POST `/api/auth/register` - Register new user with USER role

## Database Migration

Flyway migration scripts are provided to:
1. Create the user_roles junction table
2. Add default USER role to existing accounts
3. Add new columns (active, firstName, lastName) to the users table

## Getting Started

1. Run the application to apply database migrations automatically
2. Use the admin setup endpoint for initial admin user creation:
   ```
   POST /api/admin/setup
   {
     "email": "admin@example.com",
     "password": "secure_password",
     "secretKey": "initialSetupSecretKey123"
   }
   ```

## Security Best Practices

1. The secret key for admin setup should be changed in production
2. JWT tokens expire after 24 hours
3. Passwords are securely hashed using BCrypt
4. Method-level security prevents unauthorized access

## Testing the Implementation

To test the role-based access control:

1. Register a new user (gets USER role)
2. Set up an admin account
3. Try accessing admin endpoints with both accounts to verify restrictions
4. Test promotion/demotion and activation/deactivation functionality
