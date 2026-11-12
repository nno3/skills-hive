package com.example.groupproject60.controller;

import com.example.groupproject60.model.Course;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.example.groupproject60.repo.CourseRepository;
import java.util.Optional;

@Controller
public class CourseViewController {

    @Autowired
    private CourseRepository courseRepository;

    @GetMapping("/course")
    public String index(Model model) {
        Iterable<Course> coursesIterable = courseRepository.findAll();
        List<Course> courses = new ArrayList<>();
        coursesIterable.forEach(courses::add);

        List<String> categories = courses.stream()
                .map(course -> course.getCategory().getName())
                .distinct()
                .collect(Collectors.toList());

        List<String> levels = courses.stream()
                .map(course -> course.getLevel().getName())
                .distinct()
                .collect(Collectors.toList());

        model.addAttribute("courses", courses);
        model.addAttribute("categories", categories);
        model.addAttribute("levels", levels);

        return "course";
    }

    @GetMapping("/courses")
    public String searchAndFilterCourses(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            Model model) {

        Iterable<Course> coursesIterable = courseRepository.findAll();
        List<Course> courses = new ArrayList<>();
        coursesIterable.forEach(courses::add);

        if (query != null && !query.isEmpty()) {
            courses = courses.stream()
                    .filter(course -> course.getTitle().toLowerCase().contains(query.toLowerCase())
                            || course.getDescription().toLowerCase().contains(query.toLowerCase()))
                    .collect(Collectors.toList());
        }
        if (category != null && !category.isEmpty()) {
            courses = courses.stream()
                    .filter(course -> course.getCategory().getName().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }
        if (level != null && !level.isEmpty()) {
            courses = courses.stream()
                    .filter(course -> course.getLevel().getName().equalsIgnoreCase(level))
                    .collect(Collectors.toList());
        }

        List<String> categories = courses.stream()
                .map(course -> course.getCategory().getName())
                .distinct()
                .collect(Collectors.toList());

        List<String> levels = courses.stream()
                .map(course -> course.getLevel().getName())
                .distinct()
                .collect(Collectors.toList());

        model.addAttribute("courses", courses);
        model.addAttribute("categories", categories);
        model.addAttribute("levels", levels);
        model.addAttribute("query", query);
        model.addAttribute("category", category);
        model.addAttribute("level", level);

        return "course";
    }

    @GetMapping("/api/courses/{id}")
    @ResponseBody
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        Optional<Course> course = courseRepository.findById(id);
        if (course.isPresent()) {
            return ResponseEntity.ok(course.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

