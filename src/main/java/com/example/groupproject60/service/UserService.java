package com.example.groupproject60.service;

import com.example.groupproject60.model.User;
import com.example.groupproject60.dto.UserDto;
import com.example.groupproject60.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

public interface UserService {

    User findByUsername(String username);

    User findByEmail(String email);  // Ensure this method is present

    User save(UserDto userDto);  // Save UserDto and map to User entity

    User save(User user);  // Add this method to save User entity

    User getUserById(Long id);  // Add this method to retrieve a user by ID

    User updateUser(User user);  // Add this method to update user information

}

