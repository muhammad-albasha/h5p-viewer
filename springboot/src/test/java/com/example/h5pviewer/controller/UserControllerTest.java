package com.example.h5pviewer.controller;

import com.example.h5pviewer.entity.Role;
import com.example.h5pviewer.entity.User;
import com.example.h5pviewer.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest {

    @TestConfiguration
    static class UserControllerTestContextConfiguration {
        @Bean
        @Primary
        public UserService userService() {
            return Mockito.mock(UserService.class);
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserService userService;

    private User adminUser;
    private User regularUser;

    @BeforeEach
    void setUp() {
        // Set up admin user
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setEmail("admin@example.com");
        adminUser.setPassword("password");
        adminUser.setFirstName("Admin");
        adminUser.setLastName("User");
        adminUser.setActive(true);
        adminUser.setRoles(new HashSet<>(Arrays.asList(Role.ADMIN, Role.USER)));

        // Set up regular user
        regularUser = new User();
        regularUser.setId(2L);
        regularUser.setEmail("user@example.com");
        regularUser.setPassword("password");
        regularUser.setFirstName("Regular");
        regularUser.setLastName("User");
        regularUser.setActive(true);
        regularUser.setRoles(new HashSet<>(Arrays.asList(Role.USER)));

        // Configure mock behavior
        when(userService.getUserById(1L)).thenReturn(Optional.of(adminUser));
        when(userService.getUserById(2L)).thenReturn(Optional.of(regularUser));
        when(userService.createUser(any(User.class))).thenReturn(regularUser);
        when(userService.createAdminUser(any(User.class))).thenReturn(adminUser);
        when(userService.promoteToAdmin(anyLong())).thenReturn(adminUser);
        when(userService.removeAdminRole(anyLong())).thenReturn(regularUser);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanAccessAllUserEndpoints() throws Exception {
        // Get all users
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk());

        // Get user by ID
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk());

        // Create user
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regularUser)))
                .andExpect(status().isOk());

        // Create admin user
        mockMvc.perform(post("/api/users/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminUser)))
                .andExpect(status().isOk());

        // Promote to admin
        mockMvc.perform(put("/api/users/2/promote"))
                .andExpect(status().isOk());

        // Demote from admin
        mockMvc.perform(put("/api/users/1/demote"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    void regularUserCannotAccessAdminEndpoints() throws Exception {
        // Try to get all users
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());

        // Try to get another user by ID
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isForbidden());

        // Try to create user
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regularUser)))
                .andExpect(status().isForbidden());

        // Try to create admin user
        mockMvc.perform(post("/api/users/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminUser)))
                .andExpect(status().isForbidden());

        // Try to promote to admin
        mockMvc.perform(put("/api/users/2/promote"))
                .andExpect(status().isForbidden());

        // Try to demote from admin
        mockMvc.perform(put("/api/users/1/demote"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = "USER")
    void userCanAccessOwnData() throws Exception {
        // Configure service to return the user when email matches
        when(userService.getUserByEmail("user@example.com")).thenReturn(Optional.of(regularUser));

        // User can access their own data
        mockMvc.perform(get("/api/users/2"))
                .andExpect(status().isOk());

        // User cannot access other users' data
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isForbidden());
    }
}
