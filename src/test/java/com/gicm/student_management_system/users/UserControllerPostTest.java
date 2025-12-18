package com.gicm.student_management_system.users;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.flash;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.gicm.student_management_system.entity.Role;
import com.gicm.student_management_system.entity.User;
import com.gicm.student_management_system.service.UserService;

/**
 * Integration tests for UserController POST endpoints
 * Tests with full Spring context, JWT and Redis disabled
 */
@SpringBootTest
@Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@DisplayName("UserController POST Endpoints Integration Tests")
class UserControllerPostTest {

    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private WebApplicationContext context;

    private User testUser;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        // Create test user in database
        testUser = new User();
        testUser.setUsername("Test User");
        testUser.setEmail("testuser@test.com");
        testUser.setPassword("password123");
        testUser.setRole(Role.GUEST);
        testUser.setCreatedAt(OffsetDateTime.now());
        testUser = userService.createUser(testUser);
    }

    // ==================== POST /users/add Tests ====================

    @Test
    @DisplayName("POST /users/add - Add new user successfully")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testAddUser_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/users/add")
                        .with(csrf())
                        .param("username", "New User")
                        .param("email", "newuser@test.com")
                        .param("password", "password123")
                        .param("role", "GUEST"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/users"))
                .andExpect(flash().attributeExists("success"))
                .andExpect(flash().attribute("success", "ユーザーが追加されました"));
    }

    @Test
    @DisplayName("POST /users/add - Fail when email already exists")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testAddUser_EmailAlreadyExists() throws Exception {
        // Act & Assert (use existing test user's email)
        mockMvc.perform(post("/users/add")
                        .with(csrf())
                        .param("username", "Duplicate User")
                        .param("email", testUser.getEmail())
                        .param("password", "password123")
                        .param("role", "GUEST"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/users/add"))
                .andExpect(flash().attributeExists("error"))
                .andExpect(flash().attribute("error", "このメールアドレスは既に使用されています"));
    }

    @Test
    @DisplayName("POST /users/add - Add user with ADMIN role")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testAddUser_WithAdminRole() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/users/add")
                        .with(csrf())
                        .param("username", "New Admin")
                        .param("email", "newadmin@test.com")
                        .param("password", "adminpassword")
                        .param("role", "ADMIN"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/users"))
                .andExpect(flash().attributeExists("success"));
    }

    // ==================== POST /users/edit/{id} Tests ====================

    @Test
    @DisplayName("POST /users/edit/{id} - Update user without changing password")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testUpdateUser_WithoutPassword() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/users/edit/" + testUser.getId())
                        .with(csrf())
                        .param("username", "Updated User")
                        .param("email", "updated@test.com")
                        .param("role", "ADMIN"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/users"))
                .andExpect(flash().attributeExists("success"))
                .andExpect(flash().attribute("success", "ユーザー情報が更新されました"));
    }

    @Test
    @DisplayName("POST /users/edit/{id} - Update user with new password")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testUpdateUser_WithNewPassword() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/users/edit/" + testUser.getId())
                        .with(csrf())
                        .param("username", "Updated User")
                        .param("email", "updated@test.com")
                        .param("role", "ADMIN")
                        .param("newPassword", "newpassword123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/users"))
                .andExpect(flash().attributeExists("success"))
                .andExpect(flash().attribute("success", "ユーザー情報が更新されました"));
    }

    @Test
    @DisplayName("POST /users/edit/{id} - Update user with empty password (password not changed)")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testUpdateUser_WithEmptyPassword() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/users/edit/" + testUser.getId())
                        .with(csrf())
                        .param("username", "Updated User")
                        .param("email", "updatedempty@test.com")
                        .param("role", "GUEST")
                        .param("newPassword", "   "))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/users"))
                .andExpect(flash().attributeExists("success"));
    }

    @Test
    @DisplayName("POST /users/edit/{id} - Fail when user not found")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testUpdateUser_UserNotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/users/edit/99999")
                        .with(csrf())
                        .param("username", "Updated User")
                        .param("email", "updated@test.com")
                        .param("role", "ADMIN"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/users"))
                .andExpect(flash().attributeExists("error"))
                .andExpect(flash().attribute("error", "ユーザーが見つかりません"));
    }

    @Test
    @DisplayName("POST /users/edit/{id} - Change role from GUEST to ADMIN")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testUpdateUser_ChangeRoleGuestToAdmin() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/users/edit/" + testUser.getId())
                        .with(csrf())
                        .param("username", "Promoted User")
                        .param("email", "promoted@test.com")
                        .param("role", "ADMIN"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/users"))
                .andExpect(flash().attributeExists("success"))
                .andExpect(flash().attribute("success", "ユーザー情報が更新されました"));
    }

    @Test
    @DisplayName("POST /users/edit/{id} - Change role from ADMIN to GUEST")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testUpdateUser_ChangeRoleAdminToGuest() throws Exception {
        // Create an ADMIN user for demotion test
        User adminUser = new User();
        adminUser.setUsername("Admin User");
        adminUser.setEmail("admindemote@test.com");
        adminUser.setPassword("password123");
        adminUser.setRole(Role.ADMIN);
        adminUser.setCreatedAt(OffsetDateTime.now());
        adminUser = userService.createUser(adminUser);

        // Act & Assert
        mockMvc.perform(post("/users/edit/" + adminUser.getId())
                        .with(csrf())
                        .param("username", "Demoted User")
                        .param("email", "demoted@test.com")
                        .param("role", "GUEST"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/users"))
                .andExpect(flash().attributeExists("success"))
                .andExpect(flash().attribute("success", "ユーザー情報が更新されました"));
    }
}
