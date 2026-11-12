package com.example.groupproject60.service;

import com.example.groupproject60.dto.LeaderboardEntry;
import com.example.groupproject60.model.User;
import com.example.groupproject60.repo.LeaderboardRepository;
import com.example.groupproject60.service.FriendshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {
    @Autowired
    private LeaderboardRepository leaderboardRepository;

    @Autowired
    private FriendshipService friendshipService;

    // Returns the overall leaderboard
    public List<LeaderboardEntry> getLeaderboard() {
        return leaderboardRepository.getLeaderboard();
    }

    // Returns a filtered leaderboard including only the current user and their accepted friends
    public List<LeaderboardEntry> getFriendsLeaderboard(User currentUser) {
        // Retrieve the current user's accepted friends
        List<User> acceptedFriends = friendshipService.getAcceptedFriends(currentUser);
        // Include the current user in the friends list
        acceptedFriends.add(currentUser);

        // Convert the list of friends to a set of usernames for quick lookup
        Set<String> friendUsernames = acceptedFriends.stream()
                .map(User::getUsername)
                .collect(Collectors.toSet());

        // Get the full leaderboard data
        List<LeaderboardEntry> fullLeaderboard = getLeaderboard();

        // Filter the leaderboard entries to include only those with usernames in friendUsernames
        return fullLeaderboard.stream()
                .filter(entry -> friendUsernames.contains(entry.getUsername()))
                .collect(Collectors.toList());
    }
}
