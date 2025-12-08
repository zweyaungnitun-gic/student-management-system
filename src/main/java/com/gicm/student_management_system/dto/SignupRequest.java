package com.gicm.student_management_system.dto;

import com.gicm.student_management_system.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {
    private String username;
    private String email;
    private String password;
    private Role role = Role.GUEST; // Default role
}
