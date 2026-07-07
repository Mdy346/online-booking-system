package com.booking.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.booking.common.BusinessException;
import com.booking.dto.LoginResponse;
import com.booking.dto.RegisterRequest;
import com.booking.entity.User;
import com.booking.mapper.UserMapper;
import com.booking.util.JwtUtil;
import com.booking.util.PasswordUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class UserService extends ServiceImpl<UserMapper, User> {

    private final JwtUtil jwtUtil;

    /** Login: verify credentials and return JWT token. */
    public LoginResponse login(String username, String password) {
        User user = lambdaQuery()
                .eq(User::getUsername, username)
                .oneOpt()
                .orElseThrow(BusinessException::loginFailed);

        if (!PasswordUtil.verify(password, user.getPasswordHash())) {
            throw BusinessException.loginFailed();
        }

        String token = jwtUtil.generateToken(user.getUserId(), user.getRole());
        return new LoginResponse(token, toUserInfo(user));
    }

    /** Register: create a new user account. */
    public LoginResponse register(RegisterRequest req) {
        // Check duplicate username
        boolean exists = lambdaQuery()
                .eq(User::getUsername, req.getUsername())
                .count() > 0;
        if (exists) {
            throw new BusinessException("该账号已被注册");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setPasswordHash(PasswordUtil.hash(req.getPassword()));
        user.setPhone(req.getPhone());
        user.setRole(req.getRole());
        user.setRegisterTime(LocalDateTime.now());
        save(user);

        String token = jwtUtil.generateToken(user.getUserId(), user.getRole());
        return new LoginResponse(token, toUserInfo(user));
    }

    /** Convert entity to response UserInfo. */
    private LoginResponse.UserInfo toUserInfo(User user) {
        return new LoginResponse.UserInfo(
                user.getUserId(),
                user.getUsername(),
                user.getPhone(),
                user.getRole(),
                user.getRegisterTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        );
    }
}
