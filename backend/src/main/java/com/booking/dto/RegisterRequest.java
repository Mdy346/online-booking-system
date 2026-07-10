package com.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "??????")
    private String username;

    @NotBlank(message = "??????")
    private String password;

    @NotBlank(message = "???????")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "????????")
    private String phone;

    @NotBlank(message = "??????")
    private String role;  // USER or MERCHANT

    @NotBlank(message = "???????")
    private String code;
}
