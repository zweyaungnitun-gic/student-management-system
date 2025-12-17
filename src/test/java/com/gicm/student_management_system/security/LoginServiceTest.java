package com.gicm.student_management_system.security;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.gicm.student_management_system.entity.Role;
import com.gicm.student_management_system.entity.User;
import com.gicm.student_management_system.repository.UserRepository;

class LoginServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // Verifies a user can log in successfully using email and gets correct role.

    @Test
    void testLoadUserByEmail_Success() {

        User user = User.builder()
                .id(1L)
                .username("Pyae Phyo Kyaw")
                .email("ppk@gmail.com")
                .password("$2a$10$encodedPassword")
                .role(Role.ADMIN)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.findByEmail("ppk@gmail.com")).thenReturn(Optional.of(user));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername("ppk@gmail.com");

        assertNotNull(userDetails);
        assertEquals("ppk@gmail.com", userDetails.getUsername());
        assertEquals("$2a$10$encodedPassword", userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")));
        verify(userRepository, times(1)).findByEmail("ppk@gmail.com");
    }

    // Ensures login fails with UsernameNotFoundException when user does not exist.

    @Test
    void testLoadUserByEmail_UserNotFound() {

        when(userRepository.findByEmail("nonexistent@gmail.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            customUserDetailsService.loadUserByUsername("nonexistent@gmail.com");
        });
        verify(userRepository, times(1)).findByEmail("nonexistent@gmail.com");
    }

    //Confirms GUEST role is correctly mapped to ROLE_GUEST.

    @Test
    void testLoadUserByUsername_WithGuestRole() {

        User user = User.builder()
                .id(2L)
                .username("Thet Paing Oo")
                .email("tpo@gmail.com")
                .password("$2a$10$guestPassword")
                .role(Role.GUEST)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.findByEmail("tpo@gmail.com")).thenReturn(Optional.of(user));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername("tpo@gmail.com");

        assertNotNull(userDetails);
        assertEquals("tpo@gmail.com", userDetails.getUsername());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_GUEST")));
        verify(userRepository, times(1)).findByEmail("tpo@gmail.com");
    }

    //Verifies user can be loaded by ID (used in JWT/session authentication).

    @Test
    void testLoadUserById_Success() {

        User user = User.builder()
                .id(1L)
                .username("Kyaw Zin Htet")
                .email("kzh@gmail.com")
                .password("$2a$10$encodedPassword")
                .role(Role.ADMIN)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        UserDetails userDetails = customUserDetailsService.loadUserById(1L);

        assertNotNull(userDetails);
        assertEquals("kzh@gmail.com", userDetails.getUsername());
        assertEquals("$2a$10$encodedPassword", userDetails.getPassword());
        verify(userRepository, times(1)).findById(1L);
    }

    // Ensures invalid user ID is rejected with an exception

    @Test
    void testLoadUserById_UserNotFound() {

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            customUserDetailsService.loadUserById(999L);
        });
        verify(userRepository, times(1)).findById(999L);
    }

    //Confirms exactly one correct authority (ROLE_ADMIN) is assigned.

    @Test
    void testLoadUserBy_VerifyAuthorities() {

        User user = User.builder()
                .id(4L)
                .username("Min Khant Soe")
                .email("mks@gmail.com")
                .password("$2a$10$adminPassword")
                .role(Role.ADMIN)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.findByEmail("mks@gmail.com")).thenReturn(Optional.of(user));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername("mks@gmail.com");

        assertNotNull(userDetails);
        assertFalse(userDetails.getAuthorities().isEmpty());
        assertEquals(1, userDetails.getAuthorities().size());
        GrantedAuthority authority = userDetails.getAuthorities().iterator().next();
        assertEquals("ROLE_ADMIN", authority.getAuthority());
        verify(userRepository, times(1)).findByEmail("mks@gmail.com");
    }

    //Verifies role mapping works when loading user by ID.

    @Test
    void testLoadUserById_WithGuestRole() {

        User user = User.builder()
                .id(6L)
                .username("Htet Myat Naing")
                .email("hmn@gmail.com")
                .password("$2a$10$guestPass")
                .role(Role.GUEST)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.findById(6L)).thenReturn(Optional.of(user));

        UserDetails userDetails = customUserDetailsService.loadUserById(6L);

        assertNotNull(userDetails);
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_GUEST")));
        verify(userRepository, times(1)).findById(6L);
    }

    //Ensures consistent behavior when the same user is loaded multiple times.

    @Test
    void testLoadUserByUsername_MultipleCallsSameEmail() {

        User user = User.builder()
                .id(7L)
                .username("Ye Lin Aung")
                .email("yla@gmail.com")
                .password("$2a$10$repeatPassword")
                .role(Role.ADMIN)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.findByEmail("yla@gmail.com")).thenReturn(Optional.of(user));

        UserDetails firstCall = customUserDetailsService.loadUserByUsername("yla@gmail.com");
        UserDetails secondCall = customUserDetailsService.loadUserByUsername("yla@gmail.com");

        assertNotNull(firstCall);
        assertNotNull(secondCall);
        assertEquals(firstCall.getUsername(), secondCall.getUsername());
        verify(userRepository, times(2)).findByEmail("yla@gmail.com");
    }
}
