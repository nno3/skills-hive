package com.example.groupproject60.service;

import com.example.groupproject60.model.CourseInProgress;
import com.example.groupproject60.model.User;
import com.example.groupproject60.repo.CourseInProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CourseInProgressService {

    @Autowired
    private CourseInProgressRepository repository;

    @Autowired
    private UserService userService;

    public CourseInProgress saveCourseInProgress(Long courseId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User currentUser = userService.findByUsername(username);

        CourseInProgress courseInProgress = new CourseInProgress(
            courseId,
            LocalDateTime.now(),
            currentUser,
            currentUser.getUsername()
        );

        return repository.save(courseInProgress);
    }

    public List<CourseInProgress> getCoursesInProgressForCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User currentUser = userService.findByUsername(username);
        return repository.findByUser(currentUser);
    }

    @Transactional
    public void removeCourseInProgress(Long courseId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User currentUser = userService.findByUsername(username);
        repository.deleteByCourseIdAndUserId(courseId, currentUser.getId());
    }

    public CourseInProgress getCourseInProgressByCourseId(Long courseId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User currentUser = userService.findByUsername(username);
        return repository.findByCourseIdAndUserId(courseId, currentUser.getId());
    }
} 