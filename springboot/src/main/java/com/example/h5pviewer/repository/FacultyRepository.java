package com.example.h5pviewer.repository;

import com.example.h5pviewer.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByName(String name);
    List<Faculty> findByNameContainingIgnoreCase(String name);
    boolean existsByName(String name);
}
