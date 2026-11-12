package com.example.groupproject60.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "user_profile")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bio;
    private String profilePictureUrl;

    // Preferences for course filtering
    // Store preferred courses as a set of strings
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "preferred_course_categories", joinColumns = @JoinColumn(name = "user_profile_id"))
    @Column(name = "category")
    private Set<String> preferredCourseCategories = new HashSet<>();

    // Relationship to track course progress

    @ElementCollection
    @CollectionTable(name = "user_completed_courses", joinColumns = @JoinColumn(name = "user_profile_id"))
    @MapKeyColumn(name = "course_id")
    @Column(name = "completion_date")
    private Map<Long, LocalDateTime> completedCourseIds = new HashMap<>();

//    @ElementCollection
//    @CollectionTable(name = "completed_courses", joinColumns = @JoinColumn(name = "user_profile_id"))
//    @Column(name = "course_id")
//    private Set<Long> completedCourseIds = new HashSet<>();

    // One-to-One relationship with User
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }

    public Set<String> getPreferredCourseCategories() {
        return preferredCourseCategories;
    }

    public void setPreferredCourseCategories(Set<String> preferredCourseCategories) {
        this.preferredCourseCategories = preferredCourseCategories;
    }

    public Map<Long, LocalDateTime> getCompletedCourseIds() {
        return completedCourseIds;
    }

    public void setCompletedCourseIds(Map<Long, LocalDateTime> completedCourseIds) {
        this.completedCourseIds = completedCourseIds;
    }
//    public Set<Long> getCompletedCourseIds() { return completedCourseIds; }
//    public void setCompletedCourseIds(Set<Long> completedCourseIds) { this.completedCourseIds = completedCourseIds; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    @Override
    public String toString() {
        return "UserProfile{" +
                "id=" + id +
                ", bio='" + bio + '\'' +
                ", profilePictureUrl='" + profilePictureUrl + '\'' +
                ", PreferredCourseCategories=" + preferredCourseCategories +
                ", completedCourseIds=" + completedCourseIds +
                ", user=" + user +
                '}';
    }
}

