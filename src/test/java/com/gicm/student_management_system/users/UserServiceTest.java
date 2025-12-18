package com.gicm.student_management_system.users;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.gicm.student_management_system.entity.Role;
import com.gicm.student_management_system.entity.User;
import com.gicm.student_management_system.repository.UserRepository;
import com.gicm.student_management_system.serviceimpl.UserServiceImpl;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllUsers() {

        User user1 = User.builder()
                .id(1L)
                .username("Pyae Phyo Kyaw")
                .email("ppk@gmail.com")
                .password("password")
                .role(Role.ADMIN)
                .createdAt(OffsetDateTime.now())
                .build();

        User user2 = User.builder()
                .id(2L)
                .username("Su Yadanar Htet")
                .email("syh@gmail.com")
                .password("password")
                .role(Role.GUEST)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.findAll()).thenReturn(Arrays.asList(user1, user2));

        List<User> users = userService.getAllUsers();

        assertNotNull(users);
        assertEquals(2, users.size());
        assertEquals("Pyae Phyo Kyaw", users.get(0).getUsername());
        assertEquals("Su Yadanar Htet", users.get(1).getUsername());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void testGetUserById_Success() {

        User user = User.builder()
                .id(1L)
                .username("Zaw Zaw Aung")
                .email("zza@gmail.com")
                .password("password")
                .role(Role.ADMIN)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Optional<User> result = userService.getUserById(1L);

        assertTrue(result.isPresent());
        assertEquals("Zaw Zaw Aung", result.get().getUsername());
        assertEquals("zza@gmail.com", result.get().getEmail());
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    void testGetUserById_NotFound() {

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<User> result = userService.getUserById(999L);

        assertFalse(result.isPresent());
        verify(userRepository, times(1)).findById(999L);
    }

    @Test
    void testGetUserByEmail_Success() {

        User user = User.builder()
                .id(1L)
                .username("Ko Ko Lwin")
                .email("kkl@gmail.com")
                .password("password")
                .role(Role.ADMIN)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.findByEmail("kkl@gmail.com")).thenReturn(Optional.of(user));

        Optional<User> result = userService.getUserByEmail("kkl@gmail.com");

        assertTrue(result.isPresent());
        assertEquals("Ko Ko Lwin", result.get().getUsername());
        verify(userRepository, times(1)).findByEmail("kkl@gmail.com");
    }

    @Test
    void testCreateUser_WithPassword() {

        User user = User.builder()
                .username("Thiha Zaw")
                .email("thz@gmail.com")
                .password("plainPassword")
                .role(Role.GUEST)
                .build();

        User savedUser = User.builder()
                .id(1L)
                .username("Thiha Zaw")
                .email("thz@gmail.com")
                .password("encodedPassword")
                .role(Role.GUEST)
                .createdAt(OffsetDateTime.now())
                .build();

        when(passwordEncoder.encode("plainPassword")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = userService.createUser(user);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Thiha Zaw", result.getUsername());
        verify(passwordEncoder, times(1)).encode("plainPassword");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testCreateUser_WithoutPassword() {

        User user = User.builder()
                .username("Myo Min Thu")
                .email("mmt@gmail.com")
                .password("")
                .role(Role.GUEST)
                .build();

        User savedUser = User.builder()
                .id(1L)
                .username("Myo Min Thu")
                .email("mmt@gmail.com")
                .password("")
                .role(Role.GUEST)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = userService.createUser(user);

        assertNotNull(result);
        assertEquals("", result.getPassword());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testUpdateUser_Success() {

        User existingUser = User.builder()
                .id(1L)
                .username("Khant Zin Win")
                .email("kzw@gmail.com")
                .password("oldPassword")
                .role(Role.GUEST)
                .createdAt(OffsetDateTime.now())
                .build();

        User updateData = User.builder()
                .username("Khant Zin Win Updated")
                .email("kzw_new@gmail.com")
                .password("newPassword")
                .role(Role.ADMIN)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        User result = userService.updateUser(1L, updateData);

        assertNotNull(result);
        assertEquals("Khant Zin Win Updated", result.getUsername());
        assertEquals("kzw_new@gmail.com", result.getEmail());
        assertEquals(Role.ADMIN, result.getRole());
        verify(passwordEncoder, times(1)).encode("newPassword");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testUpdateUser_NotFound() {

        User updateData = User.builder()
                .username("Nyan Lin Htet")
                .email("nlh@gmail.com")
                .role(Role.ADMIN)
                .build();

        when(userRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> {
            userService.updateUser(999L, updateData);
        });
        verify(userRepository, times(1)).findById(999L);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testUpdateUserPassword_Success() {

        User user = User.builder()
                .id(1L)
                .username("Soe Moe Aung")
                .email("sma@gmail.com")
                .password("oldPassword")
                .role(Role.ADMIN)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPassword123")).thenReturn("encodedNewPassword123");
        when(userRepository.save(any(User.class))).thenReturn(user);

        userService.updateUserPassword(1L, "newPassword123");

        verify(passwordEncoder, times(1)).encode("newPassword123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testDeleteUser_Success() {

        when(userRepository.existsById(1L)).thenReturn(true);
        doNothing().when(userRepository).deleteById(1L);

        userService.deleteUser(1L);

        verify(userRepository, times(1)).existsById(1L);
        verify(userRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteUser_NotFound() {

        when(userRepository.existsById(999L)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> {
            userService.deleteUser(999L);
        });
        verify(userRepository, times(1)).existsById(999L);
        verify(userRepository, never()).deleteById(anyLong());
    }

    @Test
    void testExistsByEmail_True() {

        when(userRepository.existsByEmail("existing@gmail.com")).thenReturn(true);

        boolean exists = userService.existsByEmail("existing@gmail.com");

        assertTrue(exists);
        verify(userRepository, times(1)).existsByEmail("existing@gmail.com");
    }

    @Test
    void testExistsByEmail_False() {

        when(userRepository.existsByEmail("nonexistent@gmail.com")).thenReturn(false);

        boolean exists = userService.existsByEmail("nonexistent@gmail.com");

        assertFalse(exists);
        verify(userRepository, times(1)).existsByEmail("nonexistent@gmail.com");
    }
}
