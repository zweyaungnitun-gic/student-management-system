package com.gicm.student_management_system.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
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
import com.gicm.student_management_system.service.UserService;

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
    public String addUser(@ModelAttribute User user, RedirectAttributes redirectAttributes) {
        // Check if email already exists
        if (userService.existsByEmail(user.getEmail())) {
            redirectAttributes.addFlashAttribute("error", "このメールアドレスは既に使用されています");
            return "redirect:/users/add";
        }

        userService.createUser(user);

        redirectAttributes.addFlashAttribute("success", "ユーザーが追加されました");
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
            @ModelAttribute User userForm,
            @RequestParam(required = false) String newPassword,
            RedirectAttributes redirectAttributes) {
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
