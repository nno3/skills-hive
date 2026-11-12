package com.example.groupproject60.repo;

import com.example.groupproject60.model.Friendship;
import com.example.groupproject60.model.FriendshipStatus;
import com.example.groupproject60.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    // Combined query: finds a friendship in either direction
    @Query("SELECT f FROM Friendship f " +
            "WHERE (f.requester = :user1 AND f.recipient = :user2) " +
            "   OR (f.requester = :user2 AND f.recipient = :user1)")
    Optional<Friendship> findByUsers(@Param("user1") User user1,
                                     @Param("user2") User user2);

    // Find pending friend requests for a recipient
    List<Friendship> findByRecipientAndStatus(User recipient, FriendshipStatus status);

    // Methods for accepted friendships
    List<Friendship> findByRequesterAndStatus(User requester, FriendshipStatus status);

    Optional<Friendship> findByRecipientAndRequester(User requester, User recipient);

    Optional<Friendship> findByRequesterAndRecipient(User requester, User recipient);

    // List<Friendship> findByRecipientAndStatus(User recipient, FriendshipStatus status);

    // If you no longer need these direct methods, you can remove them:
    // Optional<Friendship> findByRequesterAndRecipient(User requester, User recipient);
    // Optional<Friendship> findByRecipientAndRequester(User recipient, User requester);
}
