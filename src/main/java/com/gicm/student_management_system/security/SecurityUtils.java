package com.gicm.student_management_system.security;

import com.gicm.student_management_system.entity.Role;
import com.gicm.student_management_system.entity.User;
import com.gicm.student_management_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    public static String getCurrentUsername() {
        Authentication auth = getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }
        return null;
    }

    public static boolean hasRole(String role) {
        Authentication auth = getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals(role));
        }
        return false;
    }

    public static boolean isSuperAdmin() {
        return hasRole("ROLE_SUPER_ADMIN");
    }

    public static boolean isAdmin() {
        return hasRole("ROLE_ADMIN");
    }

    public Optional<User> getCurrentUser() {
        String email = getCurrentUsername();
        if (email == null) {
            return Optional.empty();
        }
        return userRepository.findByEmail(email);
    }

    public Long getCurrentUserId() {
        return getCurrentUser().map(User::getId).orElse(null);
    }

    public Role getCurrentUserRole() {
        return getCurrentUser().map(User::getRole).orElse(null);
    }

    /**
     * Check if current user can access data created by the given admin ID.
     * Super admin can access all data, regular admin can only access their own data.
     */
    public boolean canAccessData(Long dataOwnerId) {
        if (isSuperAdmin()) {
            return true;
        }
        Long currentUserId = getCurrentUserId();
        return currentUserId != null && currentUserId.equals(dataOwnerId);
    }

    /**
     * Get the admin ID to filter by. Returns null for super admin (see all data),
     * returns current user ID for regular admin (see only their data).
     */
    public Long getTenantFilterId() {
        if (isSuperAdmin()) {
            return null; // No filter, see all data
        }
        return getCurrentUserId(); // Filter by current admin ID
    }
}
