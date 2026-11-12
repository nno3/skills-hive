package com.example.groupproject60.service;

import com.example.groupproject60.model.Friendship;
import com.example.groupproject60.model.FriendshipStatus;
import com.example.groupproject60.model.User;
import com.example.groupproject60.repo.FriendshipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FriendshipService {

    @Autowired
    private FriendshipRepository friendshipRepository;

    /**
     * Sends a friend request from the requester to the recipient (by username).
     * If a pending friend request already exists between these users,
     * it is returned instead of throwing an error.
     */
    public Friendship sendFriendRequest(User requester, User recipient) {
        if (recipient == null) {
            throw new RuntimeException("User not found.");
        }

        // Prevent sending a friend request to oneself.
        if (requester.getId().equals(recipient.getId())) {
            throw new RuntimeException("You cannot send a friend request to yourself.");
        }

        // Check if they are already friends.
        List<User> acceptedFriends = getAcceptedFriends(requester);
        if (acceptedFriends.contains(recipient)) {
            throw new RuntimeException("You are already friends with " + recipient.getUsername() + ".");
        }

        // Check for an existing pending friend request.
        Optional<Friendship> existingFriendship = friendshipRepository.findByUsers(requester, recipient);
        if (existingFriendship.isPresent() && existingFriendship.get().getStatus() == FriendshipStatus.PENDING) {
            // Instead of erroring out, return the existing pending friendship.
            return existingFriendship.get();
        }

        try {
            // Create and save a new friend request with PENDING status.
            Friendship friendship = new Friendship(requester, recipient, FriendshipStatus.PENDING);
            return friendshipRepository.save(friendship);
        } catch (DataIntegrityViolationException ex) {
            // In case of a concurrent duplicate submission, fetch the existing pending friendship.
            Optional<Friendship> duplicateFriendship = friendshipRepository.findByUsers(requester, recipient);
            if (duplicateFriendship.isPresent() && duplicateFriendship.get().getStatus() == FriendshipStatus.PENDING) {
                return duplicateFriendship.get();
            }
            throw new RuntimeException("Failed to send friend request.");
        }
    }

    /**
     * Accepts a friend request by updating its status.
     */
    public Friendship acceptFriendRequest(Long friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friend request not found."));
        friendship.setStatus(FriendshipStatus.ACCEPTED);
        return friendshipRepository.save(friendship);
    }

    /**
     * Declines a friend request by updating its status.
     */
    public Friendship declineFriendRequest(Long friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friend request not found."));
        friendship.setStatus(FriendshipStatus.DECLINED);
        return friendshipRepository.save(friendship);
    }

    /**
     * Retrieves pending friend requests for a recipient.
     */
    public List<Friendship> getPendingRequests(User recipient) {
        return friendshipRepository.findByRecipientAndStatus(recipient, FriendshipStatus.PENDING);
    }

    /**
     * Returns a list of accepted friends for the given user.
     */
    public List<User> getAcceptedFriends(User user) {
        // Friendships where the user initiated the request and it was accepted.
        List<Friendship> sentRequests = friendshipRepository.findByRequesterAndStatus(user, FriendshipStatus.ACCEPTED);
        // Friendships where the user received the request and accepted it.
        List<Friendship> receivedRequests = friendshipRepository.findByRecipientAndStatus(user, FriendshipStatus.ACCEPTED);

        List<User> acceptedFriends = new ArrayList<>();
        for (Friendship friendship : sentRequests) {
            acceptedFriends.add(friendship.getRecipient());
        }
        for (Friendship friendship : receivedRequests) {
            acceptedFriends.add(friendship.getRequester());
        }
        return acceptedFriends;
    }

    public void removeFriend(User user, User friend) {
        Optional<Friendship> friendshipOpt = friendshipRepository.findByUsers(user, friend);
        if (friendshipOpt.isEmpty()) {
            throw new RuntimeException("Friendship does not exist.");
        }

        Friendship friendship = friendshipOpt.get();
        // Optionally check if friendship.getStatus() == FriendshipStatus.ACCEPTED
        friendshipRepository.delete(friendship);
    }


    public boolean areFriends(User user1, User user2) {
        return getAcceptedFriends(user1).contains(user2);
    }


}
