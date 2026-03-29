package com.gicm.student_management_system.serviceimpl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gicm.student_management_system.entity.User;
import com.gicm.student_management_system.repository.UserRepository;
import com.gicm.student_management_system.service.UserIdGeneratorService;
import com.gicm.student_management_system.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserIdGeneratorService userIdGeneratorService;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, 
                        UserIdGeneratorService userIdGeneratorService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userIdGeneratorService = userIdGeneratorService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    @Transactional
    public User createUser(User user) {
        // Generate userId if not provided
        if (user.getUserId() == null || user.getUserId().isEmpty()) {
            user.setUserId(userIdGeneratorService.generateUserId());
        }
        
        // Encode password before saving
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateUser(Long id, User user) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        // Update fields
        existingUser.setUsername(user.getUsername());
        existingUser.setEmail(user.getEmail());
        existingUser.setRole(user.getRole());
        existingUser.setSchoolName(user.getSchoolName());
        
        // Only update password if provided
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        
        return userRepository.save(existingUser);
    }

    @Override
    @Transactional
    public void updateUserPassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> searchUsers(String search) {
        if (search == null || search.isEmpty()) {
            return getAllUsers();
        }
        
        String searchLower = search.toLowerCase();
        return userRepository.findAll().stream()
                .filter(user -> user.getUsername().toLowerCase().contains(searchLower) ||
                               user.getEmail().toLowerCase().contains(searchLower))
                .collect(Collectors.toList());
    }
}
