package com.gicm.student_management_system.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.gicm.student_management_system.entity.Role;
import com.gicm.student_management_system.entity.User;
import com.gicm.student_management_system.repository.UserRepository;

@Controller
@RequestMapping("/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public String listUsers(
            @RequestParam(value = "nameSearch", required = false) String nameSearch,
            @RequestParam(value = "roleFilter", required = false) String roleFilter,
            Model model) {
        
        List<User> users = userRepository.findAll();
        
        // Apply filters if provided
        if (nameSearch != null && !nameSearch.isEmpty()) {
            users = users.stream()
                    .filter(user -> user.getUsername().toLowerCase().contains(nameSearch.toLowerCase()))
                    .toList();
        }
        
        if (roleFilter != null && !roleFilter.isEmpty()) {
            users = users.stream()
                    .filter(user -> user.getRole().toString().equals(roleFilter))
                    .toList();
        }
        
        model.addAttribute("users", users);
        model.addAttribute("nameSearch", nameSearch);
        model.addAttribute("roleFilter", roleFilter);
        
        return "users/list-dashboard";
    }

    @GetMapping("/add")
    public String addUserForm(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("roles", Role.values());
        return "users/add";
    }

    @PostMapping("/add")
    public String addUser(@ModelAttribute User user, RedirectAttributes redirectAttributes) {
        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            redirectAttributes.addFlashAttribute("error", "このメールアドレスは既に使用されています");
            return "redirect:/users/add";
        }
        
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        userRepository.save(user);
        
        redirectAttributes.addFlashAttribute("success", "ユーザーが追加されました");
        return "redirect:/users";
    }

  

    @GetMapping("/edit/{id}")
    public String editUserForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        User user = userRepository.findById(id).orElse(null);
        
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "ユーザーが見つかりません");
            return "redirect:/users";
        }
        
        model.addAttribute("user", user);
        model.addAttribute("roles", Role.values());
        return "users/edit";
    }

    @PostMapping("/edit/{id}")
    public String updateUser(@PathVariable Long id, 
                           @ModelAttribute User userForm,
                           @RequestParam(required = false) String newPassword,
                           RedirectAttributes redirectAttributes) {
        User user = userRepository.findById(id).orElse(null);
        
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "ユーザーが見つかりません");
            return "redirect:/users";
        }
        
        // Update user fields
        user.setUsername(userForm.getUsername());
        user.setEmail(userForm.getEmail());
        user.setRole(userForm.getRole());
        
        // Update password only if a new one is provided
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(newPassword));
        }
        
        userRepository.save(user);
        
        redirectAttributes.addFlashAttribute("success", "ユーザー情報が更新されました");
        return "redirect:/users";
    }

    @GetMapping("/delete/{id}")
    public String deleteUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        User user = userRepository.findById(id).orElse(null);
        
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "ユーザーが見つかりません");
            return "redirect:/users";
        }
        
        userRepository.delete(user);
        
        redirectAttributes.addFlashAttribute("success", "ユーザーが削除されました");
        return "redirect:/users";
    }
}
