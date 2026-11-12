package com.example.groupproject60.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class TetrisGame {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private int level;
    private int highScore;
    private boolean isUnlocked;
    private LocalDateTime lastPlayed;
    private int requiredHours;

    // Constructors
    public TetrisGame() {}

    public TetrisGame(User user, int level, int requiredHours) {
        this.user = user;
        this.level = level;
        this.highScore = 0;
        this.isUnlocked = level == 1; // Level 1 is always unlocked
        this.requiredHours = requiredHours;
        this.lastPlayed = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getHighScore() {
        return highScore;
    }

    public void setHighScore(int highScore) {
        this.highScore = highScore;
    }

    public boolean isUnlocked() {
        return isUnlocked;
    }

    public void setUnlocked(boolean unlocked) {
        isUnlocked = unlocked;
    }

    public LocalDateTime getLastPlayed() {
        return lastPlayed;
    }

    public void setLastPlayed(LocalDateTime lastPlayed) {
        this.lastPlayed = lastPlayed;
    }

    public int getRequiredHours() {
        return requiredHours;
    }

    public void setRequiredHours(int requiredHours) {
        this.requiredHours = requiredHours;
    }
} 