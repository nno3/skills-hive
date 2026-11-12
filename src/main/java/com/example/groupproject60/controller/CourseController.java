package com.example.groupproject60.controller;

import com.example.groupproject60.model.Course;
import com.example.groupproject60.repo.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    // Get all courses
    @GetMapping
    public List<Course> getAllCourses() {
        Iterable<Course> coursesIterable = courseRepository.findAll();
        List<Course> courses = new ArrayList<>();
        coursesIterable.forEach(courses::add);
        return courses;
    }

    // Search courses by title or description
    @GetMapping("/search")
    public List<Course> searchCourses(@RequestParam String query) {
        return courseRepository.searchCourses(query);
    }

    // Filter courses by category and/or level
    @GetMapping("/filter")
    public List<Course> filterCourses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level) {
        if (category != null && level != null) {
            return courseRepository.findByCategoryNameAndLevelName(category, level);
        } else if (category != null) {
            return courseRepository.findByCategoryName(category);
        } else if (level != null) {
            return courseRepository.findByLevelName(level);
        } else {
            Iterable<Course> coursesIterable = courseRepository.findAll();
            List<Course> courses = new ArrayList<>();
            coursesIterable.forEach(courses::add);
            return courses;
        }
    }

    // Combined search and filter
    @GetMapping("/search-and-filter")
    public List<Course> searchAndFilterCourses(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level) {
        return courseRepository.searchAndFilterCourses(
                query != null ? query : "",
                category,
                level
        );
    }
}
