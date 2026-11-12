package com.example.groupproject60.service;

import com.example.groupproject60.model.Badge;
import com.example.groupproject60.model.User;
import com.example.groupproject60.repo.BadgeRepository;
import com.example.groupproject60.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
public class BadgeAwardService {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserService userService;

    public void
    checkAndAwardBadges(
            User user, double completedHours) {
        List<Badge> existingBadges = badgeRepository.findByUserOrderByEarnedAtDesc(user);
        Set<Badge.BadgeType> existingBadgeTypes = existingBadges.stream()
                .map(Badge::getType)
                .collect(Collectors.toSet());

        if (completedHours >= 10 && !existingBadgeTypes.contains(Badge.BadgeType.BRONZE)) {
            Badge bronzeBadge = new Badge();
            bronzeBadge.setUser(user);
            bronzeBadge.setHoursCompleted(completedHours);
            bronzeBadge.setEarnedAt(LocalDateTime.now());
            bronzeBadge.setType(Badge.BadgeType.BRONZE);
            badgeRepository.save(bronzeBadge);
        }

        if (completedHours >= 20 && !existingBadgeTypes.contains(Badge.BadgeType.SILVER)) {
            Badge silverBadge = new Badge();
            silverBadge.setUser(user);
            silverBadge.setHoursCompleted(completedHours);
            silverBadge.setEarnedAt(LocalDateTime.now());
            silverBadge.setType(Badge.BadgeType.SILVER);
            badgeRepository.save(silverBadge);
        }

        if (completedHours >= 30 && !existingBadgeTypes.contains(Badge.BadgeType.GOLD)) {
            Badge goldBadge = new Badge();
            goldBadge.setUser(user);
            goldBadge.setHoursCompleted(completedHours);
            goldBadge.setEarnedAt(LocalDateTime.now());
            goldBadge.setType(Badge.BadgeType.GOLD);
            badgeRepository.save(goldBadge);
        }
    }
}