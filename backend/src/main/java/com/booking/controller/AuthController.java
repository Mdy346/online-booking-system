package com.booking.controller;

import com.booking.common.ApiResponse;
import com.booking.dto.LoginRequest;
import com.booking.dto.LoginResponse;
import com.booking.dto.RegisterRequest;
import com.booking.dto.SendCodeRequest;
import com.booking.service.UserService;
import com.booking.service.VerificationCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final VerificationCodeService verificationCodeService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        LoginResponse resp = userService.login(req.getUsername(), req.getPassword());
        return ApiResponse.success(resp);
    }

    @PostMapping("/send-code")
    public ApiResponse<String> sendCode(@Valid @RequestBody SendCodeRequest req) {
        String code = verificationCodeService.sendCode(req.getPhone());
        return ApiResponse.success("??????", code);
    }

    @PostMapping("/register")
    public ApiResponse<LoginResponse> register(@Valid @RequestBody RegisterRequest req) {
        LoginResponse resp = userService.register(req);
        return ApiResponse.success("????", resp);
    }
}
