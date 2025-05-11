package com.example.h5pviewer.service;

import com.example.h5pviewer.entity.Role;
import com.example.h5pviewer.entity.User;
import com.example.h5pviewer.exception.ResourceNotFoundException;
import com.example.h5pviewer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    /**
     * Get user by email
     * @param email the email to search for
     * @return Optional containing the user if found
     */
    public Optional<User> getUserByEmail(String email) {
        User user = userRepository.findByEmail(email);
        return Optional.ofNullable(user);
    }/**
     * Creates a new user with a default USER role
     * @param user the user data (email, password will be encoded)
     * @return the created user
     */
    @Transactional
    public User createUser(User user) {
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Set default role to USER if no roles are specified
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            roles.add(Role.USER);
            user.setRoles(roles);
        }
        
        return userRepository.save(user);
    }
    
    /**
     * Creates a new admin user
     * @param user the user data
     * @return the created admin user
     */
    @Transactional
    public User createAdminUser(User user) {
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Ensure user has ADMIN role
        Set<Role> roles = user.getRoles() != null ? user.getRoles() : new HashSet<>();
        roles.add(Role.ADMIN);
        // Also add USER role by default
        roles.add(Role.USER);
        user.setRoles(roles);
        
        return userRepository.save(user);
    }
    
    /**
     * Adds an admin role to an existing user
     * @param userId the ID of the user to promote
     * @return the updated user
     */
    @Transactional
    public User promoteToAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        Set<Role> roles = user.getRoles() != null ? user.getRoles() : new HashSet<>();
        roles.add(Role.ADMIN);
        user.setRoles(roles);
        
        return userRepository.save(user);
    }
    
    /**
     * Removes the admin role from a user
     * @param userId the ID of the user to demote
     * @return the updated user
     */
    @Transactional
    public User removeAdminRole(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        Set<Role> roles = user.getRoles();
        roles.remove(Role.ADMIN);
        user.setRoles(roles);
        
        return userRepository.save(user);
    }
      /**
     * Updates a user
     * @param id the user ID
     * @param userDetails the updated user data
     * @return the updated user
     */
    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        user.setEmail(userDetails.getEmail());
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setActive(userDetails.isActive());
        
        // Only update password if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        
        return userRepository.save(user);
    }
    
    /**
     * Updates a user directly
     * @param user the user to update
     * @return the updated user
     */
    @Transactional
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    /**
     * Find user by ID
     * @param id the user ID
     * @return the user or null if not found
     */
    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    /**
     * Deletes a user
     * @param id the user ID
     */
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        userRepository.deleteById(id);
    }
}
