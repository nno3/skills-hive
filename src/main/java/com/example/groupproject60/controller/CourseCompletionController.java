package com.example.groupproject60.controller;

import com.example.groupproject60.model.CourseCompletion;
import com.example.groupproject60.service.CourseCompletionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course-completion")
public class CourseCompletionController {

    @Autowired
    private CourseCompletionService courseCompletionService;

    // Endpoint to save a course completion record
//    @PostMapping
//    public CourseCompletion saveCompletion(@RequestBody CourseCompletion courseCompletion) {
//        return courseCompletionService.saveCompletion(courseCompletion);
//    }

    // New endpoint: Get all course completions for the currently authenticated user
    @GetMapping("/my")
    public List<CourseCompletion> getMyCourseCompletions() {
        return courseCompletionService.getCourseCompletionsForCurrentUser();
    }

    @PostMapping
    public ResponseEntity<List<CourseCompletion>> saveCompletion(@RequestBody CourseCompletion courseCompletion) {
        CourseCompletion savedCompletion = courseCompletionService.saveCompletion(courseCompletion);
        List<CourseCompletion> completions = courseCompletionService.getCourseCompletionsForCurrentUser();
        return ResponseEntity.ok(completions);
    }
}
