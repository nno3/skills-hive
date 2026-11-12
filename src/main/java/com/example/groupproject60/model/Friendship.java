package com.example.groupproject60.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "friendship", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"requester_id", "recipient_id"})
})
public class Friendship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The user who initiated the friend request
    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester;

    // The user receiving the friend request
    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @Enumerated(EnumType.STRING)
    private FriendshipStatus status;

    private LocalDateTime createdAt;

    // Default constructor sets the creation time
    public Friendship() {
        this.createdAt = LocalDateTime.now();
    }

    // Parameterized constructor for creating a new friendship
    public Friendship(User requester, User recipient, FriendshipStatus status) {
        this.requester = requester;
        this.recipient = recipient;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public User getRequester() {
        return requester;
    }

    public void setRequester(User requester) {
        this.requester = requester;
    }

    public User getRecipient() {
        return recipient;
    }

    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }

    public FriendshipStatus getStatus() {
        return status;
    }

    public void setStatus(FriendshipStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}

