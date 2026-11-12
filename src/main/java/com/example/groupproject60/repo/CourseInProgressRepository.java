package com.example.groupproject60.repo;

import com.example.groupproject60.model.CourseInProgress;
import com.example.groupproject60.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseInProgressRepository extends JpaRepository<CourseInProgress, Long> {
    List<CourseInProgress> findByUser(User user);
    List<CourseInProgress> findByUserId(Long userId);
    void deleteByCourseIdAndUserId(Long courseId, Long userId);
    CourseInProgress findByCourseIdAndUserId(Long courseId, Long userId);
} 