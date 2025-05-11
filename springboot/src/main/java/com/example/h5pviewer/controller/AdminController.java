package com.example.h5pviewer.controller;

import com.example.h5pviewer.entity.User;
import com.example.h5pviewer.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    private final UserService userService;
    
    @Autowired
    public AdminController(UserService userService) {
        this.userService = userService;
    }
    
    @PostMapping("/setup")
    public ResponseEntity<?> setupAdmin(@RequestBody Map<String, String> adminData) {
        try {
            String email = adminData.get("email");
            String password = adminData.get("password");
            String secretKey = adminData.get("secretKey");
            
            // Very simple security check with a secret key
            // In production, use more secure approaches like environment variables
            if (!"initialSetupSecretKey123".equals(secretKey)) {
                return ResponseEntity.status(403).body(Map.of("error", "Invalid secret key"));
            }
            
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }
            
            // Create new admin user
            User newAdmin = new User();
            newAdmin.setEmail(email);
            newAdmin.setPassword(password);
            newAdmin.setActive(true);
            
            User savedAdmin = userService.createAdminUser(newAdmin);
            return ResponseEntity.ok(Map.of(
                "message", "Admin user created successfully",
                "user", Map.of(
                    "id", savedAdmin.getId(),
                    "email", savedAdmin.getEmail(),
                    "roles", savedAdmin.getRoles()
                )
            ));
        } catch (Exception e) {
            System.out.println("Error creating admin: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create admin: " + e.getMessage()));
        }
    }
    
    @PostMapping("/users/{userId}/promote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> promoteUserToAdmin(@PathVariable Long userId) {
        try {
            User updatedUser = userService.promoteToAdmin(userId);
            return ResponseEntity.ok(Map.of(
                "message", "User promoted to admin successfully",
                "user", Map.of(
                    "id", updatedUser.getId(),
                    "email", updatedUser.getEmail(),
                    "roles", updatedUser.getRoles()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to promote user: " + e.getMessage()));
        }
    }
    
    @PostMapping("/users/{userId}/demote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> demoteAdmin(@PathVariable Long userId) {
        try {
            User updatedUser = userService.removeAdminRole(userId);
            return ResponseEntity.ok(Map.of(
                "message", "Admin role removed successfully",
                "user", Map.of(
                    "id", updatedUser.getId(),
                    "email", updatedUser.getEmail(),
                    "roles", updatedUser.getRoles()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to remove admin role: " + e.getMessage()));
        }
    }
    
    @PostMapping("/users/{userId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> activateUser(@PathVariable Long userId) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            user.setActive(true);
            User updatedUser = userService.updateUser(user);
            
            return ResponseEntity.ok(Map.of(
                "message", "User activated successfully",
                "user", Map.of(
                    "id", updatedUser.getId(),
                    "email", updatedUser.getEmail(),
                    "active", updatedUser.isActive()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to activate user: " + e.getMessage()));
        }
    }
    
    @PostMapping("/users/{userId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deactivateUser(@PathVariable Long userId) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            user.setActive(false);
            User updatedUser = userService.updateUser(user);
            
            return ResponseEntity.ok(Map.of(
                "message", "User deactivated successfully",
                "user", Map.of(
                    "id", updatedUser.getId(),
                    "email", updatedUser.getEmail(),
                    "active", updatedUser.isActive()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to deactivate user: " + e.getMessage()));
        }
    }
}
