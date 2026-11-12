package com.example.groupproject60.controller;

import com.example.groupproject60.dto.FriendsSummaryDto;
import com.example.groupproject60.dto.FriendsSummaryDto;
import com.example.groupproject60.dto.UserDto;
import com.example.groupproject60.model.Badge;
import com.example.groupproject60.model.Friendship;
import com.example.groupproject60.model.User;
import com.example.groupproject60.model.UserProfile;
import com.example.groupproject60.repo.BadgeRepository;
import com.example.groupproject60.repo.CourseCompletionRepository;
import com.example.groupproject60.repo.FriendshipRepository;
import com.example.groupproject60.repo.UserRepository;
import com.example.groupproject60.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/friends")
public class FriendshipController {

    @Autowired
    private FriendshipService friendshipService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private TetrisGameService tetrisGameService;

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private CourseCompletionService courseCompletionService;

    @Autowired
    private UserProfileService userProfileService;

    /**
     * Render the friends page (friends.html).
     */
    @GetMapping
    public String getFriendsPage(Principal principal, Model model) {
        User currentUser = getUserFromPrincipal(principal);
        List<Friendship> pendingRequests = friendshipService.getPendingRequests(currentUser);
        List<User> acceptedFriends = friendshipService.getAcceptedFriends(currentUser);

        model.addAttribute("pendingRequests", pendingRequests);
        model.addAttribute("friends", acceptedFriends);
        return "friends";
    }

    /**
     * Send a friend request by recipient username (returns a ResponseEntity<String>).
     */
    @PostMapping("/request")
    public ResponseEntity<String> sendFriendRequestByUsername(
            Principal principal,
            @RequestParam("recipientUsername") String recipientUsername) {

        User requester = getUserFromPrincipal(principal);

        // Validate the recipient username
        if (recipientUsername == null || recipientUsername.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username cannot be empty.");
        }

        User recipient = userRepository.findByUsername(recipientUsername);
        if (recipient == null) {
            return ResponseEntity.badRequest().body("User with username '" + recipientUsername + "' not found.");
        }

        // Check if the recipient is already a friend
        List<User> acceptedFriends = friendshipService.getAcceptedFriends(requester);
        if (acceptedFriends.contains(recipient)) {
            return ResponseEntity.badRequest().body("User is already a friend.");
        }

        // Check if a request has already been sent in either direction
        Optional<Friendship> existingRequest1 = friendshipRepository.findByRequesterAndRecipient(requester, recipient);
        Optional<Friendship> existingRequest2 = friendshipRepository.findByRecipientAndRequester(requester, recipient);
        if (existingRequest1.isPresent() || existingRequest2.isPresent()) {
            return ResponseEntity.badRequest().body("Friend request already sent.");
        }

        try {
            friendshipService.sendFriendRequest(requester, recipient);
            return ResponseEntity.ok("Friend request sent to " + recipientUsername + "!");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /**
     * Send a friend request by recipient ID (returns JSON).
     */
    @PostMapping("/request/{recipientId}")
    @ResponseBody
    public ResponseEntity<Friendship> sendFriendRequestById(
            Principal principal,
            @PathVariable Long recipientId) {

        User requester = getUserFromPrincipal(principal);
        User recipient = getUserById(recipientId);

        if (recipient == null) {
            throw new RuntimeException("User not found.");
        }

        try {
            Friendship friendship = friendshipService.sendFriendRequest(requester, recipient);
            return ResponseEntity.ok(friendship);
        } catch (RuntimeException ex) {
            throw new RuntimeException(ex.getMessage());
        }
    }

    /**
     * Accept a friend request (returns JSON).
     */
    @PostMapping("/accept/{friendshipId}")
    @ResponseBody
    public ResponseEntity<Friendship> acceptFriendRequest(@PathVariable Long friendshipId) {


        try {
            return ResponseEntity.ok(friendshipService.acceptFriendRequest(friendshipId));
        } catch (RuntimeException ex) {
            throw new RuntimeException(ex.getMessage());
        }
    }

    /**
     * Decline a friend request (returns JSON).
     */
    @PostMapping("/decline/{friendshipId}")
    @ResponseBody
    public ResponseEntity<Friendship> declineFriendRequest(@PathVariable Long friendshipId) {
        try {
            return ResponseEntity.ok(friendshipService.declineFriendRequest(friendshipId));
        } catch (RuntimeException ex) {
            throw new RuntimeException(ex.getMessage());
        }
    }

    /**
     * Get all pending friend requests for the current user (returns JSON).
     */
    @GetMapping("/requests")
    @ResponseBody
    public ResponseEntity<List<Friendship>> getPendingRequests(Principal principal) {
        User recipient = getUserFromPrincipal(principal);
        return ResponseEntity.ok(friendshipService.getPendingRequests(recipient));
    }

    /**
     * Search for users by partial username (returns JSON).
     */
    @GetMapping("/search")
    @ResponseBody
    public ResponseEntity<List<UserDto>> searchUsers(@RequestParam String query) {
        List<User> users = userRepository.findByUsernameContainingIgnoreCase(query);
        List<UserDto> userDtos = users.stream()
                .map(user -> new UserDto(user.getUsername(), user.getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    /**
     * Helper method to get the current user from Principal.
     */
    private User getUserFromPrincipal(Principal principal) {
        String username = principal.getName();
        return userRepository.findByUsername(username);
    }

    /**
     * Helper method to get a User by their ID.
     */
    private User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @PostMapping("/remove/{friendUsername}")
    @ResponseBody
    public ResponseEntity<String> removeFriend(Principal principal,
                                               @PathVariable String friendUsername) {
        User currentUser = getUserFromPrincipal(principal);
        User friend = userRepository.findByUsername(friendUsername);

        if (friend == null) {
            return ResponseEntity.badRequest().body("Friend not found.");
        }

        try {
            friendshipService.removeFriend(currentUser, friend);
            return ResponseEntity.ok("Friend removed.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/summary/{friendUsername}")
    @ResponseBody
    public ResponseEntity<FriendsSummaryDto> getFriendSummary(@PathVariable String friendUsername, Principal principal) {
        User currentUser = getUserFromPrincipal(principal);
        User friend = userRepository.findByUsername(friendUsername);

        if (friend == null || !friendshipService.areFriends(currentUser, friend)) {
            return ResponseEntity.badRequest().body(null);
        }

        double totalHours = courseCompletionService.calculateTotalHoursCompleted(friend);
        int highestScore = tetrisGameService.getHighestScore(friend.getId());
        List<Badge> badges = badgeService.getUserBadges(friend);
        // Get the user profile to retrieve the bio
        UserProfile friendProfile = userProfileService.getProfileByUserId(friend.getId());
        String bio = (friendProfile != null) ? friendProfile.getBio() : "No bio available";

        FriendsSummaryDto summary = new FriendsSummaryDto(totalHours, highestScore, badges, bio);
        return ResponseEntity.ok(summary);
    }


}
