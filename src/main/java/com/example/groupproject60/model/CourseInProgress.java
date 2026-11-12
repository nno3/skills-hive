package com.example.groupproject60.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class CourseInProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long courseId;
    private LocalDateTime startTime;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String username;

    public CourseInProgress() {
    }

    public CourseInProgress(Long courseId, LocalDateTime startTime, User user, String username) {
        this.courseId = courseId;
        this.startTime = startTime;
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setUser(User user) {
        this.user = user;
        if (user != null) {
            this.username = user.getUsername();
        }
    }

    public User getUser() {
        return user;
    }
} 