package com.example.groupproject60.repo;

import com.example.groupproject60.model.Course;
import com.example.groupproject60.model.CourseCompletion;
import com.example.groupproject60.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseCompletionRepository extends JpaRepository<CourseCompletion, Long> {

    // Find completions by user
    List<CourseCompletion> findByUser(User user);

    List<CourseCompletion> findByUserId(Long userId);
}