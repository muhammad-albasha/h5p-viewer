## User and Role Database Schema

```sql
-- Users table
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User roles junction table
CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role VARCHAR(20) NOT NULL,
  PRIMARY KEY (user_id, role),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Entity Relationship Diagram

```
+---------------+       +----------------+
|    users      |       |   user_roles   |
+---------------+       +----------------+
| id (PK)       |<----->| user_id (PK/FK)|
| email         |       | role (PK)      |
| password      |       |                |
| first_name    |       +----------------+
| last_name     |
| active        |
| created_at    |
| updated_at    |
+---------------+
```

## Sample Queries

### Get All Users with Their Roles

```sql
SELECT u.id, u.email, u.first_name, u.last_name, u.active, ur.role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.id, ur.role;
```

### Get Only Admin Users

```sql
SELECT DISTINCT u.id, u.email, u.first_name, u.last_name, u.active
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'ADMIN'
ORDER BY u.id;
```

### Get All Roles for a Specific User

```sql
SELECT ur.role
FROM user_roles ur
WHERE ur.user_id = ?;
```

### Add Role to a User

```sql
INSERT INTO user_roles (user_id, role)
VALUES (?, ?);
```

### Remove Role from a User

```sql
DELETE FROM user_roles
WHERE user_id = ? AND role = ?;
```

### Activate/Deactivate a User

```sql
UPDATE users
SET active = ?
WHERE id = ?;
```
