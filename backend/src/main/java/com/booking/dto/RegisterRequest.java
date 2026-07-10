package com.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "账户名")
    private String username;

    @NotBlank(message = "密码")
    private String password;

    @NotBlank(message = "001")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号")
    private String phone;

    @NotBlank(message = "身份")
    private String role;  // USER or MERCHANT
}
