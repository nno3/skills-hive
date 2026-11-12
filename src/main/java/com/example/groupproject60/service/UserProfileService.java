package com.example.groupproject60.service;

import com.example.groupproject60.model.UserProfile;
import com.example.groupproject60.repo.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
public class UserProfileService {

    @Autowired
    private UserProfileRepository userProfileRepository;

    public UserProfile save(UserProfile userProfile) {
        System.out.println("Saving UserProfile: " + userProfile);
        return userProfileRepository.save(userProfile);
    }

    public UserProfile updateProfile(UserProfile userProfile) {
        System.out.println("Updating user profile: " + userProfile.getId());

        // Access the User object from UserProfile
        if (userProfile.getUser() != null) {
            System.out.println("New Name: " + userProfile.getUser().getFirstname() + " " + userProfile.getUser().getLastname());
            System.out.println("New Email: " + userProfile.getUser().getEmail());
        }

        // Log the bio
        if (userProfile.getBio() != null) {
            System.out.println("New Bio: " + userProfile.getBio());
        }

        return userProfileRepository.save(userProfile);
    }

    // Renamed for clarity, as this method fetches UserProfile by its own ID, not the user's ID
    public UserProfile getProfileByUserProfileId(Long id) {
        return userProfileRepository.findById(id).orElse(null);
    }

    // Fetch the profile by the userId
    public UserProfile getProfileByUserId(Long userId) {
        return userProfileRepository.findByUserId(userId);
    }

//    public void markCourseAsCompleted(Long userId, Long courseId) {
//        UserProfile userProfile = userProfileRepository.findById(userId).orElse(null);
//        if (userProfile != null) {
//            userProfile.getCompletedCourseIds().add(courseId);
//            userProfileRepository.save(userProfile); // save() is provided by JpaRepository
//        } else {
//            // Log the error or handle accordingly
//            System.out.println("UserProfile not found for userId: " + userId);
//        }
//    }



    public void updatePreferredCategories(Long userId, String categories) {
        UserProfile userProfile = userProfileRepository.findById(userId).orElse(null);
        if (userProfile != null) {
            // Convert the comma-separated categories string to a Set<String>
            Set<String> categoriesSet = new HashSet<>(Arrays.asList(categories.split(",")));
            userProfile.setPreferredCourseCategories(categoriesSet);
            userProfileRepository.save(userProfile);
        } else {
            // Log the error or handle accordingly
            System.out.println("UserProfile not found for userId: " + userId);
        }
    }


    public void markCourseAsCompleted(Long userId, Long courseId) {
        UserProfile userProfile = userProfileRepository.findByUserId(userId);
        if (userProfile != null) {
            userProfile.getCompletedCourseIds().put(courseId, LocalDateTime.now());
            userProfileRepository.save(userProfile);
        } else {
            System.out.println("UserProfile not found for userId: " + userId);
        }
    }
}
