package com.example.groupproject60.dto;

import com.example.groupproject60.model.Badge;
import com.example.groupproject60.model.CourseCompletion;

import java.util.List;

public class FriendsSummaryDto {
    private double totalHours;
    private int highestScore;
    private List<Badge> badges;
    private String bio;

    private List<CourseCompletion> completions;

    public FriendsSummaryDto(double totalHours, int highestScore, List<Badge> badges, String bio) {
        this.totalHours = totalHours;
        this.highestScore = highestScore;
        this.badges = badges;
        this.bio = bio;
       // this.completions = completions;
    }

    public List<CourseCompletion> getCompletions() {
        return completions;
    }

    public void setCompletions(List<CourseCompletion> completions) {
        this.completions = completions;
    }

    // Getters and setters
    public double getTotalHours() {
        return totalHours;
    }

    public void setTotalHours(double totalHours) {
        this.totalHours = totalHours;
    }

    public int getHighestScore() {
        return highestScore;
    }

    public void setHighestScore(int highestScore) {
        this.highestScore = highestScore;
    }

    public List<Badge> getBadges() {
        return badges;
    }

    public void setBadges(List<Badge> badges) {
        this.badges = badges;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}