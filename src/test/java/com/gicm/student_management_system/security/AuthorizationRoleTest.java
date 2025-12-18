package com.gicm.student_management_system.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import com.gicm.student_management_system.entity.Role;
import com.gicm.student_management_system.entity.User;
import com.gicm.student_management_system.service.UserService;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

/**
 * Integration tests for UserController authorization
 * Tests role-based access control with full Spring context
 * JWT and Redis are disabled in test environment
 */
@SpringBootTest
@Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@DisplayName("Authorization Integration Tests - User Controller")
class AuthorizationRoleTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserService userService;

    @BeforeEach
    void setupMockMvc() {
        this.mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    // ==================== ADMIN Role Tests ====================

    @Test
    @DisplayName("ADMIN can access GET /users")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void adminCanAccessUsersList() throws Exception {
        mockMvc.perform(get("/users").with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("ADMIN can access GET /users/add")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void adminCanAccessAddUserForm() throws Exception {
        mockMvc.perform(get("/users/add").with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("ADMIN can access POST /users/add")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void adminCanAddUser() throws Exception {
        mockMvc.perform(post("/users/add")
                        .with(csrf())
                        .param("username", "New User")
                        .param("email", "newuser@test.com")
                        .param("password", "password123")
                        .param("role", "GUEST"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    @DisplayName("ADMIN can access GET /users/edit/{id}")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void adminCanAccessEditUserForm() throws Exception {
        User u = userService.createUser(User.builder()
            .username("Edit Target")
            .email("edit.target@test.com")
            .password("pwd12345")
            .role(Role.GUEST)
            .build());

        mockMvc.perform(get("/users/edit/" + u.getId()).with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("ADMIN can access POST /users/edit/{id}")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void adminCanEditUser() throws Exception {
        User u = userService.createUser(User.builder()
            .username("Update Target")
            .email("update.target@test.com")
            .password("pwd12345")
            .role(Role.GUEST)
            .build());

        mockMvc.perform(post("/users/edit/" + u.getId())
                        .with(csrf())
                        .param("username", "Updated User")
                        .param("email", "updated@test.com")
                        .param("role", "ADMIN"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    @DisplayName("ADMIN can access GET /users/delete/{id}")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void adminCanDeleteUser() throws Exception {
        User u = userService.createUser(User.builder()
            .username("Delete Target")
            .email("delete.target@test.com")
            .password("pwd12345")
            .role(Role.GUEST)
            .build());

        mockMvc.perform(get("/users/delete/" + u.getId()).with(csrf()))
                .andExpect(status().is3xxRedirection());
    }

    // ==================== GUEST Role Tests (Access Denied) ====================

    @Test
    @DisplayName("GUEST cannot access GET /users")
    @WithMockUser(username = "guest@test.com", roles = "GUEST")
    void guestCannotAccessUsersList() throws Exception {
        mockMvc.perform(get("/users").with(csrf()))
                .andExpect(status().is(403));
    }

    @Test
    @DisplayName("GUEST cannot access GET /users/add")
    @WithMockUser(username = "guest@test.com", roles = "GUEST")
    void guestCannotAccessAddUserForm() throws Exception {
        mockMvc.perform(get("/users/add").with(csrf()))
                .andExpect(status().is(403));
    }

    @Test
    @DisplayName("GUEST cannot access POST /users/add")
    @WithMockUser(username = "guest@test.com", roles = "GUEST")
    void guestCannotAddUser() throws Exception {
        mockMvc.perform(post("/users/add")
                        .with(csrf())
                        .param("username", "New User")
                        .param("email", "newuser@test.com")
                        .param("password", "password123")
                        .param("role", "GUEST"))
                .andExpect(status().is(403));
    }

    @Test
    @DisplayName("GUEST cannot access GET /users/edit/{id}")
    @WithMockUser(username = "guest@test.com", roles = "GUEST")
    void guestCannotAccessEditUserForm() throws Exception {
        mockMvc.perform(get("/users/edit/1").with(csrf()))
                .andExpect(status().is(403));
    }

    @Test
    @DisplayName("GUEST cannot access POST /users/edit/{id}")
    @WithMockUser(username = "guest@test.com", roles = "GUEST")
    void guestCannotEditUser() throws Exception {
        mockMvc.perform(post("/users/edit/1")
                        .with(csrf())
                        .param("username", "Updated User")
                        .param("email", "updated@test.com")
                        .param("role", "ADMIN"))
                .andExpect(status().is(403));
    }

    @Test
    @DisplayName("GUEST cannot access GET /users/delete/{id}")
    @WithMockUser(username = "guest@test.com", roles = "GUEST")
    void guestCannotDeleteUser() throws Exception {
        mockMvc.perform(get("/users/delete/1").with(csrf()))
                .andExpect(status().is(403));
    }

    // ==================== Unauthenticated Tests ====================

    @Test
    @DisplayName("Unauthenticated user redirected from GET /users")
    void unauthenticatedUserRedirectedFromUsersList() throws Exception {
        mockMvc.perform(get("/users"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    @DisplayName("Unauthenticated user redirected from GET /users/add")
    void unauthenticatedUserRedirectedFromAddForm() throws Exception {
        mockMvc.perform(get("/users/add"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    @DisplayName("Unauthenticated user redirected from POST /users/add")
    void unauthenticatedUserRedirectedFromAddUser() throws Exception {
        mockMvc.perform(post("/users/add")
                        .with(csrf())
                        .param("username", "New User")
                        .param("email", "newuser@test.com")
                        .param("password", "password123")
                        .param("role", "GUEST"))
                .andExpect(status().is3xxRedirection());
    }
}
