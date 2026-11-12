package com.example.groupproject60.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class CourseCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // New field to store the course id from the front-end
    private Long courseId;

    // Existing fields
    private LocalDateTime startTime;
    private LocalDateTime completionTime;
    private double durationHours;
    private int durationMinutes;

    // Store the user_id via relationship
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // New: Store the username as a separate column
    private String username;

    public CourseCompletion() {
    }

    public CourseCompletion(Long courseId, LocalDateTime startTime, LocalDateTime completionTime,
                            double durationHours, int durationMinutes, User user, String username) {
        this.courseId = courseId;
        this.startTime = startTime;
        this.completionTime = completionTime;
        this.durationHours = durationHours;
        this.durationMinutes = durationMinutes;
        this.user = user;
        this.username = username;
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getCompletionTime() {
        return completionTime;
    }

    public void setCompletionTime(LocalDateTime completionTime) {
        this.completionTime = completionTime;
    }

    public double getDurationHours() {
        return durationHours;
    }

    public void setDurationHours(double durationHours) {
        this.durationHours = durationHours;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    // Properly implemented setter for the user
    public void setUser(User user) {
        this.user = user;
        if (user != null) {
            this.username = user.getUsername(); // Ensures both fields are in sync
        }
    }

    // Getter for user if needed
    public User getUser() {
        return user;
    }
}
