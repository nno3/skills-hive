package com.example.groupproject60.service;

import com.example.groupproject60.model.Badge;
import com.example.groupproject60.model.CourseCompletion;
import com.example.groupproject60.model.User;
import com.example.groupproject60.repo.BadgeRepository;
import com.example.groupproject60.repo.CourseCompletionRepository; // Import the repository
import org.hibernate.validator.internal.util.stereotypes.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserService userService;

    @Lazy // Add this annotation
    private final CourseCompletionService courseCompletionService;

    @Autowired
    public BadgeService(BadgeRepository badgeRepository, UserService userService, CourseCompletionService courseCompletionService) {
        this.badgeRepository = badgeRepository;
        this.userService = userService;
        this.courseCompletionService = courseCompletionService;
    }


    public List<Badge> getUserBadges(User user) {
        return badgeRepository.findByUserOrderByEarnedAtDesc(user);
    }


}
