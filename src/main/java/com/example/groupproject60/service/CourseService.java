package com.example.groupproject60.service;

import com.example.groupproject60.model.Course;
import com.example.groupproject60.model.CourseCompletion;
import com.example.groupproject60.model.User;
import com.example.groupproject60.model.UserProfile;
import com.example.groupproject60.repo.CourseCompletionRepository;
import com.example.groupproject60.repo.CourseRepository;
import com.example.groupproject60.repo.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseCompletionRepository courseCompletionRepository;

    public List<Course> getCoursesByCategory(Long categoryId) {
        return courseRepository.findByCategoryId(categoryId);
    }

    public List<Course> getCoursesByLevel(Long levelId) {
        return courseRepository.findByLevelId(levelId);
    }

    public List<Course> getCoursesByCategoryAndLevel(Long categoryId, Long levelId) {
        return courseRepository.findByCategoryIdAndLevelId(categoryId, levelId);
    }

    public List<Course> searchCourses(String query) {
        return courseRepository.searchCourses(query);
    }

    public Course addCourse(Course course) {
        return courseRepository.save(course);
    }

    public List<Course> getAllCourses() {
        Iterable<Course> iterable = courseRepository.findAll();
        List<Course> courses = new ArrayList<>();
        iterable.forEach(courses::add);
        return courses;
    }


    @Autowired
    private UserProfileRepository userProfileRepository;

    public List<Course> getRecommendedCourses(Long userId) {
        UserProfile userProfile = userProfileRepository.findByUserId(userId);
        if (userProfile == null || userProfile.getPreferredCourseCategories().isEmpty()) {
            return new ArrayList<>(); // Return empty list if no preferences are set
        }

        // Fetch courses for each preferred category
        List<Course> recommendedCourses = new ArrayList<>();
        for (String category : userProfile.getPreferredCourseCategories()) {
            recommendedCourses.addAll(courseRepository.findByCategoryName(category));
        }

        return recommendedCourses;
    }


    public List<Course> getChallengingCourses(String skillLevel) {
        // Define the levels in order of difficulty
        List<String> levels = Arrays.asList("Beginner", "Intermediate", "Advanced");

        // Get the index of the user's skill level
        int userLevelIndex = levels.indexOf(skillLevel);

        // Fetch courses that are of a higher level than the user's skill level
        if (userLevelIndex < levels.size() - 1) {
            // Use userLevelIndex + 1 instead of + 3 to get the next level
            String nextLevel = levels.get(userLevelIndex + 1);
            return courseRepository.findByLevelName(nextLevel);
        }

        return Collections.emptyList(); // No challenging courses if user is already at the highest level
    }

    public List<Course> getLevelBasedCourses(String userSkillLevel) {
        // Get courses that match the user's current skill level
        List<Course> levelCourses = courseRepository.findByLevelName(userSkillLevel);

        // If we don't have enough courses at the exact level, we can include courses from adjacent levels
        if (levelCourses.size() < 5) {
            // Define the levels in order
            List<String> levels = Arrays.asList("Beginner", "Intermediate", "Advanced");
            int currentLevelIndex = levels.indexOf(userSkillLevel);

            // If there's a level below current level, include some of those courses
            if (currentLevelIndex > 0) {
                String lowerLevel = levels.get(currentLevelIndex - 1);
                levelCourses.addAll(courseRepository.findByLevelName(lowerLevel));
            }

            // If there's a level above current level, include some of those courses
            if (currentLevelIndex < levels.size() - 1) {
                String higherLevel = levels.get(currentLevelIndex + 1);
                levelCourses.addAll(courseRepository.findByLevelName(higherLevel));
            }
        }

        // Shuffle the courses to mix different levels if we added adjacent levels
        Collections.shuffle(levelCourses);

        // Return at most 10 courses
        return levelCourses.stream().limit(10).collect(Collectors.toList());
    }
    public Course getCourseById(Long courseId) {
        Optional<Course> course = courseRepository.findById(courseId);  // Fetching course by ID from the repository
        return course.orElse(null);  // Return the course if present, otherwise return null
    }


}



