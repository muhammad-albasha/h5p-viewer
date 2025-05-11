package com.example.h5pviewer;

import com.example.h5pviewer.entity.Role;
import com.example.h5pviewer.entity.User;
import com.example.h5pviewer.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import com.example.h5pviewer.config.JwtProperties;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
@EnableCaching
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Autowired
    private UserService userService;

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            // Check if an admin user already exists by email
            if (userService.getUserByEmail("admin@example.com").isEmpty()) {
                User adminUser = new User();
                adminUser.setEmail("admin@example.com");
                adminUser.setPassword("adminpassword"); // Set raw password, UserService will encode it
                adminUser.setFirstName("Admin");
                adminUser.setLastName("User");
                adminUser.addRole(Role.ADMIN);
                adminUser.setActive(true);

                userService.createUser(adminUser);
                System.out.println("Default admin user created.");
            } else {
                System.out.println("Admin user already exists.");
            }
        };
    }
}
