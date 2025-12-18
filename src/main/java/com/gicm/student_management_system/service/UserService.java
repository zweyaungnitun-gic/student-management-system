package com.gicm.student_management_system.service;

import java.util.List;
import java.util.Optional;

import com.gicm.student_management_system.entity.User;

public interface UserService {
    
    /**
     * Get all users
     * @return List of all users
     */
    List<User> getAllUsers();
    
    /**
     * Get user by ID
     * @param id User ID
     * @return Optional containing user if found
     */
    Optional<User> getUserById(Long id);
    
    /**
     * Get user by email
     * @param email User email
     * @return Optional containing user if found
     */
    Optional<User> getUserByEmail(String email);
    
    /**
     * Create a new user
     * @param user User to create
     * @return Created user
     */
    User createUser(User user);
    
    /**
     * Update an existing user
     * @param id User ID
     * @param user Updated user data
     * @return Updated user
     */
    User updateUser(Long id, User user);
    
    /**
     * Update user password
     * @param id User ID
     * @param newPassword New password (will be encoded)
     */
    void updateUserPassword(Long id, String newPassword);
    
    /**
     * Delete user by ID
     * @param id User ID
     */
    void deleteUser(Long id);
    
    /**
     * Check if email exists
     * @param email Email to check
     * @return true if email exists
     */
    boolean existsByEmail(String email);
    
    /**
     * Search users by name or email
     * @param search Search term
     * @return List of matching users
     */
    List<User> searchUsers(String search);
}
