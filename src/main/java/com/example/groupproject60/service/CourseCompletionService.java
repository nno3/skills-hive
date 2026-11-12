package com.example.groupproject60.service;

import com.example.groupproject60.model.CourseCompletion;
import com.example.groupproject60.model.User;
import com.example.groupproject60.repo.CourseCompletionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseCompletionService {

    @Autowired
    private CourseCompletionRepository repository;

    @Autowired
    private UserService userService;

    @Autowired
    private BadgeAwardService badgeAwardService;

    // Save a course completion record
    public CourseCompletion saveCompletion(CourseCompletion courseCompletion) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User currentUser = userService.findByUsername(username);

        courseCompletion.setUser(currentUser);
        courseCompletion.setUsername(currentUser.getUsername());

        CourseCompletion savedCompletion = repository.save(courseCompletion);

        // Calculate total hours completed by the user
        double totalHoursCompleted = calculateTotalHoursCompleted(currentUser);

        // Check and award badges
        badgeAwardService.checkAndAwardBadges(currentUser, totalHoursCompleted);

        return savedCompletion;
    }

    // Calculate total hours completed by the user
    public double calculateTotalHoursCompleted(User user) {
        List<CourseCompletion> completions = repository.findByUser(user);
        return completions.stream()
                .mapToDouble(cc -> cc.getDurationHours() + cc.getDurationMinutes() / 60.0)
                .sum();
    }

    // Get course completions for the current user
//    public List<CourseCompletion> getCourseCompletionsForCurrentUser() {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        String username = auth.getName();
//        User currentUser = userService.findByUsername(username);
//        List<CourseCompletion> completions = repository.findByUser(currentUser);
//        System.out.println("Fetched completions for user " + username + ": " + completions);
//        return completions;
//    }

    public List<CourseCompletion> getCourseCompletionsForCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User currentUser = userService.findByUsername(username);
        List<CourseCompletion> completions = repository.findByUser(currentUser);
        
        // Sort completions by completion time (most recent first)
        completions.sort((a, b) -> b.getCompletionTime().compareTo(a.getCompletionTime()));
        
        return completions;
    }

    // Add this method to get completions for a specific user (not just current user)
    public List<CourseCompletion> getCourseCompletionsForUser(User user) {
        List<CourseCompletion> completions = repository.findByUser(user);
        
        // Sort completions by completion time (most recent first)
        completions.sort((a, b) -> b.getCompletionTime().compareTo(a.getCompletionTime()));
        
        return completions;
    }
}
