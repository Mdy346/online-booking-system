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

    public LoginResponse register(RegisterRequest req) {
        // 检查用户名是否重复
        boolean usernameExists = lambdaQuery()
                .eq(User::getUsername, req.getUsername())
                .count() > 0;
        if (usernameExists) {
            throw new BusinessException("用户名已存在");
        }

        // 检查手机号是否已注册
        boolean phoneExists = lambdaQuery()
                .eq(User::getPhone, req.getPhone())
                .count() > 0;
        if (phoneExists) {
            throw new BusinessException("手机号已被注册");
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
