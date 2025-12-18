package com.gicm.student_management_system.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.gicm.student_management_system.entity.Role;
import com.gicm.student_management_system.entity.User;
import com.gicm.student_management_system.service.UserService;

import jakarta.validation.Valid;

@Controller
@RequestMapping("/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public String listUsers(
            @RequestParam(value = "search", required = false) String search,
            Model model) {

        List<User> users = userService.searchUsers(search);

        model.addAttribute("users", users);
        model.addAttribute("search", search);

        return "users/list-dashboard";
    }

    @GetMapping("/add")
    public String addUserForm(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("roles", Role.values());
        return "users/add";
    }

    @PostMapping("/add")
    public String addUser(@Valid @ModelAttribute User user, BindingResult bindingResult, Model model) {
        // Store password to preserve it on validation errors
        String submittedPassword = user.getPassword();
        
        // Check for validation errors
        if (bindingResult.hasErrors()) {
            model.addAttribute("roles", Role.values());
            model.addAttribute("submittedPassword", submittedPassword);
            return "users/add";
        }

        // Check if email already exists
        if (userService.existsByEmail(user.getEmail())) {
            bindingResult.rejectValue("email", "error.user", "このメールアドレスは既に使用されています");
            model.addAttribute("roles", Role.values());
            model.addAttribute("submittedPassword", submittedPassword);
            return "users/add";
        }

        // Validate password
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            bindingResult.rejectValue("password", "error.user", "パスワードは必須です");
            model.addAttribute("roles", Role.values());
            model.addAttribute("submittedPassword", submittedPassword);
            return "users/add";
        }

        userService.createUser(user);

        model.addAttribute("success", "ユーザーが追加されました");
        return "redirect:/users";
    }

    @GetMapping("/edit/{id}")
    public String editUserForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        User user = userService.getUserById(id).orElse(null);

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
            @Valid @ModelAttribute User userForm,
            BindingResult bindingResult,
            @RequestParam(required = false) String newPassword,
            Model model,
            RedirectAttributes redirectAttributes) {
        
        // Fetch the original user to preserve immutable fields
        User originalUser = userService.getUserById(id).orElse(null);
        if (originalUser == null) {
            redirectAttributes.addFlashAttribute("error", "ユーザーが見つかりません");
            return "redirect:/users";
        }

        // Preserve immutable fields (id, createdAt) in the form object
        userForm.setId(originalUser.getId());
        userForm.setCreatedAt(originalUser.getCreatedAt());
        
        // Check for validation errors
        if (bindingResult.hasErrors()) {
            model.addAttribute("roles", Role.values());
            model.addAttribute("newPassword", newPassword); // Preserve password field
            return "users/edit";
        }

        // Check if email already exists for another user
        User existingUser = userService.getUserByEmail(userForm.getEmail()).orElse(null);
        if (existingUser != null && !existingUser.getId().equals(id)) {
            bindingResult.rejectValue("email", "error.user", "このメールアドレスは既に使用されています");
            model.addAttribute("roles", Role.values());
            model.addAttribute("newPassword", newPassword); // Preserve password field
            return "users/edit";
        }

        try {
            // Set password if provided
            if (newPassword != null && !newPassword.trim().isEmpty()) {
                userForm.setPassword(newPassword);
            }

            userService.updateUser(id, userForm);

            redirectAttributes.addFlashAttribute("success", "ユーザー情報が更新されました");
            return "redirect:/users";
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", "ユーザーが見つかりません");
            return "redirect:/users";
        }
    }

    @GetMapping("/delete/{id}")
    public String deleteUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            userService.deleteUser(id);
            redirectAttributes.addFlashAttribute("success", "ユーザーが削除されました");
            return "redirect:/users";
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", "ユーザーが見つかりません");
            return "redirect:/users";
        }
    }
}
