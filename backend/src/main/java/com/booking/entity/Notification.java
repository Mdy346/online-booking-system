package com.booking.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("T_Notification")
public class Notification {
    @TableId(type = IdType.AUTO)
    private Integer notifId;
    private Integer userId;
    private String title;
    private String message;
    private String relatedType;
    private Integer relatedId;
    private Integer isRead;
    private LocalDateTime createTime;
}
