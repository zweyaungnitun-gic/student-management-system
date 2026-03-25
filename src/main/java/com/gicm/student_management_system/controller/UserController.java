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
import com.gicm.student_management_system.security.SecurityUtils;
import com.gicm.student_management_system.service.UserService;

import jakarta.validation.Valid;

@Controller
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final SecurityUtils securityUtils;

    public UserController(UserService userService, SecurityUtils securityUtils) {
        this.userService = userService;
        this.securityUtils = securityUtils;
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public String listUsers(
            @RequestParam(value = "search", required = false) String search,
            Model model) {

        List<User> users = userService.searchUsers(search);

        model.addAttribute("users", users);
        model.addAttribute("search", search);

        return "users/list-dashboard";
    }

    @GetMapping("/add")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public String addUserForm(Model model) {
        model.addAttribute("user", new User());
        // Only allow creating ADMIN and GUEST users (not SUPER_ADMIN)
        model.addAttribute("roles", new Role[]{Role.ADMIN, Role.GUEST});
        return "users/add";
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public String addUser(@Valid @ModelAttribute User user, BindingResult bindingResult, Model model) {
        // Prevent creating SUPER_ADMIN through this form
        if (user.getRole() == Role.SUPER_ADMIN) {
            bindingResult.rejectValue("role", "error.user", "SUPER_ADMINは作成できません");
            model.addAttribute("roles", new Role[]{Role.ADMIN, Role.GUEST});
            return "users/add";
        }
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

    @PostMapping("/edit/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or @userController.isCurrentUser(#id)")
    public String updateUser(@PathVariable Long id,
            @Valid @ModelAttribute User userForm,
            BindingResult bindingResult,
            @RequestParam(required = false) String newPassword,
            Model model,
            RedirectAttributes redirectAttributes) {
        
        User originalUser = userService.getUserById(id).orElse(null);
        if (originalUser == null) {
            redirectAttributes.addFlashAttribute("error", "ユーザーが見つかりません");
            return "redirect:/users";
        }

        // Only SUPER_ADMIN can change roles or edit other users
        if (!SecurityUtils.isSuperAdmin()) {
            // Regular users can only edit themselves
            if (!securityUtils.getCurrentUserId().equals(id)) {
                redirectAttributes.addFlashAttribute("error", "他のユーザーを編集する権限がありません");
                return "redirect:/dashboard";
            }
            // Regular users cannot change their own role
            userForm.setRole(originalUser.getRole());
        }

        userForm.setId(originalUser.getId());
        userForm.setCreatedAt(originalUser.getCreatedAt());
        
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
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public String deleteUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            // Prevent deleting the last SUPER_ADMIN
            User userToDelete = userService.getUserById(id).orElse(null);
            if (userToDelete != null && userToDelete.getRole() == Role.SUPER_ADMIN) {
                redirectAttributes.addFlashAttribute("error", "SUPER_ADMINは削除できません");
                return "redirect:/users";
            }
            userService.deleteUser(id);
            redirectAttributes.addFlashAttribute("success", "ユーザーが削除されました");
            return "redirect:/users";
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", "ユーザーが見つかりません");
            return "redirect:/users";
        }
    }

    @GetMapping("/edit/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or @userController.isCurrentUser(#id)")
    public String showEditForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        User user = userService.getUserById(id).orElse(null);
        
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "ユーザーが見つかりません");
            return "redirect:/users";
        }
        
        // Regular users can only edit themselves
        if (!SecurityUtils.isSuperAdmin() && !securityUtils.getCurrentUserId().equals(id)) {
            redirectAttributes.addFlashAttribute("error", "他のユーザーを編集する権限がありません");
            return "redirect:/dashboard";
        }
        
        model.addAttribute("user", user);
        // SUPER_ADMIN can change roles, regular users cannot
        if (SecurityUtils.isSuperAdmin()) {
            model.addAttribute("roles", Role.values());
        } else {
            model.addAttribute("roles", new Role[]{user.getRole()}); // Cannot change role
        }
        return "users/edit";
    }

    /**
     * Helper method for SpEL expression to check if the given user ID is the current user
     */
    public boolean isCurrentUser(Long id) {
        return securityUtils.getCurrentUserId().equals(id);
    }
}
