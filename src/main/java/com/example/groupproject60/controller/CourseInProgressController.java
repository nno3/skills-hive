package com.example.groupproject60.controller;

import com.example.groupproject60.model.CourseInProgress;
import com.example.groupproject60.service.CourseInProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course-in-progress")
public class CourseInProgressController {

    @Autowired
    private CourseInProgressService courseInProgressService;

    @PostMapping("/{courseId}")
    public ResponseEntity<CourseInProgress> saveCourseInProgress(@PathVariable Long courseId) {
        CourseInProgress savedProgress = courseInProgressService.saveCourseInProgress(courseId);
        return ResponseEntity.ok(savedProgress);
    }

    @GetMapping("/my")
    public ResponseEntity<List<CourseInProgress>> getMyCoursesInProgress() {
        List<CourseInProgress> coursesInProgress = courseInProgressService.getCoursesInProgressForCurrentUser();
        return ResponseEntity.ok(coursesInProgress);
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> removeCourseInProgress(@PathVariable Long courseId) {
        courseInProgressService.removeCourseInProgress(courseId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/get/{courseId}")
    public ResponseEntity<CourseInProgress> getCourseInProgress(@PathVariable Long courseId) {
        CourseInProgress courseInProgress = courseInProgressService.getCourseInProgressByCourseId(courseId);
        if (courseInProgress != null) {
            return ResponseEntity.ok(courseInProgress);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
} 