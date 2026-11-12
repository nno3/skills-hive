package com.example.groupproject60.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.TreeMap;

@Entity
@Table(name = "badges")
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BadgeType type;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private double hoursCompleted;

    @Column(nullable = false)
    private LocalDateTime earnedAt;

    public enum BadgeType {
        BRONZE("/photos/bronze-badge.png"),
        SILVER("/photos/silver-badge.png"),
        GOLD("/photos/gold-badge.png");

        private final String imagePath;

        BadgeType(String imagePath) {
            this.imagePath = imagePath;
        }

        public String getImagePath() {
            return imagePath;
        }
    }

    // Method to assign badge based on hoursCompleted
    public void assignBadge() {
        System.out.println("Debug: hoursCompleted = " + hoursCompleted);  // Debugging line

        // Create a TreeMap to define the badge thresholds
        Map<Double, BadgeType> badgeMap = new TreeMap<>();
        badgeMap.put(50.0, BadgeType.GOLD);
        badgeMap.put(30.0, BadgeType.SILVER);
        badgeMap.put(10.0, BadgeType.BRONZE);

        // Find the correct badge by iterating through the map and selecting the first matching threshold
        for (Map.Entry<Double, BadgeType> entry : badgeMap.entrySet()) {
            if (hoursCompleted >= entry.getKey()) {
                this.type = entry.getValue();
                System.out.println("Assigned " + entry.getValue());
                return;
            }
        }

        // If no badge is found, assign null
        this.type = null;
        System.out.println("No badge assigned");
    }


    // Getter and Setter methods
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BadgeType getType() {
        return type;
    }

    public void setType(BadgeType type) {
        this.type = type;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public double getHoursCompleted() {
        return hoursCompleted;
    }

    public void setHoursCompleted(double hoursCompleted) {

        this.hoursCompleted = hoursCompleted;
        assignBadge();  // Make sure badge is assigned when hours are set
    }

    public LocalDateTime getEarnedAt() {
        return earnedAt;
    }

    public void setEarnedAt(LocalDateTime earnedAt) {
        this.earnedAt = earnedAt;
    }

    public String getImagePath() {
        return type != null ? type.getImagePath() : null;
    }
}