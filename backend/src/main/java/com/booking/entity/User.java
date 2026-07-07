package com.booking.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * User entity — maps to T_User table.
 * Supports both regular users (USER) and merchants (MERCHANT).
 */
@Data
@TableName("T_User")
public class User {

    @TableId(type = IdType.AUTO)
    private Integer userId;

    private String username;

    private String passwordHash;

    private String phone;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime registerTime;

    private String role;  // USER | MERCHANT | ADMIN
}
