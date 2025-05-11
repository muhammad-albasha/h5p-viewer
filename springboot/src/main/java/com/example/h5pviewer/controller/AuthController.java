package com.example.h5pviewer.controller;

import com.example.h5pviewer.entity.User;
import com.example.h5pviewer.repository.UserRepository;
import com.example.h5pviewer.service.UserService;
import com.example.h5pviewer.config.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    
    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            UserService userService,
            JwtUtil jwtUtil,
            UserDetailsService userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }@PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        try {
            String email = loginData.get("email");
            String password = loginData.get("password");
            
            if (email == null || password == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Email and password are required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Log authentication attempt (without password)
            System.out.println("Login attempt for user: " + email);
            
            // Authenticate user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
            
            // Load user with authorities
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            
            // Generate token with roles
            String token = jwtUtil.generateToken(userDetails);
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("message", "Login successful");
            
            // Get user details to return with the response
            User user = userRepository.findByEmail(email);
            if (user != null) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("email", user.getEmail());
                userMap.put("id", user.getId());
                userMap.put("roles", user.getRoles());
                userMap.put("firstName", user.getFirstName());
                userMap.put("lastName", user.getLastName());
                userMap.put("active", user.isActive());
                response.put("user", userMap);
            }
            
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            System.out.println("Authentication error: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid credentials");
            return ResponseEntity.status(401).body(errorResponse);
        } catch (Exception e) {
            System.out.println("Unexpected error during login: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "An unexpected error occurred");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> registerData) {
        try {
            String email = registerData.get("email");
            String password = registerData.get("password");
            String firstName = registerData.get("firstName");
            String lastName = registerData.get("lastName");
            
            if (email == null || password == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Email and password are required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            if (password.length() < 6) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Password must be at least 6 characters long");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            if (userRepository.findByEmail(email) != null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Email already exists");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            User user = new User();
            user.setEmail(email);
            user.setPassword(password); // UserService will encode the password
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setActive(true);
            
            // Create user with default USER role
            User savedUser = userService.createUser(user);
            
            // Load user with authorities for token generation
            UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
            
            // Generate token for the newly registered user
            String token = jwtUtil.generateToken(userDetails);
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("message", "User registered successfully");
            
            // Return user details
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("email", savedUser.getEmail());
            userMap.put("id", savedUser.getId());
            userMap.put("roles", savedUser.getRoles());
            userMap.put("firstName", savedUser.getFirstName());
            userMap.put("lastName", savedUser.getLastName());
            userMap.put("active", savedUser.isActive());
            response.put("user", userMap);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error during registration: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "An unexpected error occurred: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
