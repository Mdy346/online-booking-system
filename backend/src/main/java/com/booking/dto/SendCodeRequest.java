package com.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SendCodeRequest {
    @NotBlank(message = "???????")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "????????")
    private String phone;
}
