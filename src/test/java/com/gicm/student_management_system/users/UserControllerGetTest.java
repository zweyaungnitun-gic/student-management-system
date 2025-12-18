package com.gicm.student_management_system.users;

import java.time.OffsetDateTime;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.flash;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.gicm.student_management_system.entity.Role;
import com.gicm.student_management_system.entity.User;
import com.gicm.student_management_system.service.UserService;

/**
 * Integration tests for UserController GET endpoints
 * Tests with full Spring context, JWT and Redis disabled
 */
@SpringBootTest
@Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@DisplayName("UserController GET Endpoints Integration Tests")
class UserControllerGetTest {

    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private WebApplicationContext context;

    private User adminUser;
    private User guestUser;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        // Create test users in database
        adminUser = new User();
        adminUser.setUsername("Admin User Test");
        adminUser.setEmail("admintest@test.com");
        adminUser.setPassword("password123");
        adminUser.setRole(Role.ADMIN);
        adminUser.setCreatedAt(OffsetDateTime.now());
        adminUser = userService.createUser(adminUser);

        guestUser = new User();
        guestUser.setUsername("Guest User Test");
        guestUser.setEmail("guesttest@test.com");
        guestUser.setPassword("password123");
        guestUser.setRole(Role.GUEST);
        guestUser.setCreatedAt(OffsetDateTime.now());
        guestUser = userService.createUser(guestUser);
    }

    // ==================== GET /users Tests ====================

    @Test
    @DisplayName("GET /users - List all users successfully")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testListUsers_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/users").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(view().name("users/list-dashboard"))
                .andExpect(model().attributeExists("users"))
                .andExpect(model().attribute("users", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    @DisplayName("GET /users - Search users with query parameter")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testListUsers_WithSearchQuery() throws Exception {
        // Arrange
        String searchQuery = "Admin";

        // Act & Assert
        mockMvc.perform(get("/users")
                        .param("search", searchQuery)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(view().name("users/list-dashboard"))
                .andExpect(model().attributeExists("users", "search"))
                .andExpect(model().attribute("users", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(model().attribute("search", searchQuery));
    }

    @Test
    @DisplayName("GET /users - Return empty list when no results")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testListUsers_EmptyResults() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/users")
                        .param("search", "nonexistentuser12345")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(view().name("users/list-dashboard"))
                .andExpect(model().attribute("users", hasSize(0)));
    }

    // ==================== GET /users/add Tests ====================

    @Test
    @DisplayName("GET /users/add - Show add user form")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testAddUserForm_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/users/add").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(view().name("users/add"))
                .andExpect(model().attributeExists("user"))
                .andExpect(model().attributeExists("roles"));
    }

    // ==================== GET /users/edit/{id} Tests ====================

    @Test
    @DisplayName("GET /users/edit/{id} - Show edit form for existing user")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testEditUserForm_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/users/edit/" + adminUser.getId()).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(view().name("users/edit"))
                .andExpect(model().attributeExists("user", "roles"));
    }

    @Test
    @DisplayName("GET /users/edit/{id} - Redirect when user not found")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testEditUserForm_UserNotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/users/edit/99999").with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/users"))
                .andExpect(flash().attributeExists("error"))
                .andExpect(flash().attribute("error", "ユーザーが見つかりません"));
    }

    // ==================== GET /users/delete/{id} Tests ====================

    @Test
    @DisplayName("GET /users/delete/{id} - Delete user successfully")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testDeleteUser_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/users/delete/" + guestUser.getId()).with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/users"))
                .andExpect(flash().attributeExists("success"))
                .andExpect(flash().attribute("success", "ユーザーが削除されました"));
    }

    @Test
    @DisplayName("GET /users/delete/{id} - Handle user not found")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void testDeleteUser_UserNotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/users/delete/99999").with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/users"))
                .andExpect(flash().attributeExists("error"))
                .andExpect(flash().attribute("error", "ユーザーが見つかりません"));
    }
}
