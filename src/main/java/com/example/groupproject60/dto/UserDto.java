package com.example.groupproject60.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

public class UserDto {

    @NotEmpty(message = "Username is required.")
    @Pattern(regexp = "^[a-zA-Z0-9]*$", message = "Username can only contain letters and numbers.")
    private String username;

    @NotEmpty(message = "Password is required.")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.")
    private String password;

    @NotEmpty(message = "First name is required.")
    @Pattern(regexp = "^[a-zA-Z\\s]*$", message = "First name can only contain letters and spaces.")
    private String firstname;

    @NotEmpty(message = "Last name is required.")
    @Pattern(regexp = "^[a-zA-Z\\s]*$", message = "Last name can only contain letters and spaces.")
    private String lastname;

    @NotEmpty(message = "Email is required.")
    @Email(message = "Email must be in a valid format.")
    private String email;

    private boolean termsAccepted;

    // Add skillLevel field
    private String skillLevel;  // Adding skillLevel field

    // Security questions and answers
    @NotEmpty(message = "Security question 1 is required.")
    private String securityQuestion1;

    @NotEmpty(message = "Security answer 1 is required.")
    private String securityAnswer1;

    @NotEmpty(message = "Security question 2 is required.")
    private String securityQuestion2;

    @NotEmpty(message = "Security answer 2 is required.")
    private String securityAnswer2;

    private long id;

    // No-argument constructor
    public UserDto() {
        // Initialize with default values if necessary
    }

    // Constructor to initialize the DTO object
    public UserDto(String username, String password, String firstname, String lastname, String email, boolean termsAccepted, String skillLevel, String securityQuestion1, String securityAnswer1, String securityQuestion2, String securityAnswer2) {
        this.username = username;
        this.password = password;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.termsAccepted = termsAccepted;
        this.skillLevel = skillLevel;
        this.securityQuestion1 = securityQuestion1;
        this.securityAnswer1 = securityAnswer1;
        this.securityQuestion2 = securityQuestion2;
        this.securityAnswer2 = securityAnswer2;
    }


    // Getters and Setters for new fields
    public String getSecurityQuestion1() {
        return securityQuestion1;
    }

    public void setSecurityQuestion1(String securityQuestion1) {
        this.securityQuestion1 = securityQuestion1;
    }

    public String getSecurityAnswer1() {
        return securityAnswer1;
    }

    public void setSecurityAnswer1(String securityAnswer1) {
        this.securityAnswer1 = securityAnswer1;
    }

    public String getSecurityQuestion2() {
        return securityQuestion2;
    }

    public void setSecurityQuestion2(String securityQuestion2) {
        this.securityQuestion2 = securityQuestion2;
    }

    public String getSecurityAnswer2() {
        return securityAnswer2;
    }

    public void setSecurityAnswer2(String securityAnswer2) {
        this.securityAnswer2 = securityAnswer2;
    }


    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isTermsAccepted() {
        return termsAccepted;
    }

    public void setTermsAccepted(boolean termsAccepted) {
        this.termsAccepted = termsAccepted;
    }

    public String getSkillLevel() {
        return skillLevel;
    }

    public void setSkillLevel(String skillLevel) {
        this.skillLevel = skillLevel;
    }

    @Override
    public String toString() {
        return "UserDto [username=" + username + ", firstname=" + firstname + ", lastname=" + lastname + ", email=" + email + ", termsAccepted=" + termsAccepted + ", skillLevel=" + skillLevel + "]";
    }


    public UserDto(String username, long id) {
        this.username = username;
        this.id = id;
    }



}
