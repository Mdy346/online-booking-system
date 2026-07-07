-- =====================================================
-- Online Reservation System - Database Initialization
-- Source: online_reservation_srs_combined.md Section 4.3
-- Target: MySQL 8.0+
-- =====================================================

CREATE DATABASE IF NOT EXISTS db_online_reservation
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE db_online_reservation;

-- 1. User & Role Table
CREATE TABLE IF NOT EXISTS T_User (
    user_id       INT AUTO_INCREMENT COMMENT '用户唯一标识',
    username      VARCHAR(50)  NOT NULL UNIQUE COMMENT '用户账号/手机号',
    password_hash CHAR(64)     NOT NULL COMMENT '密码哈希(SHA256)',
    phone         VARCHAR(20)  NOT NULL COMMENT '用户联系手机号',
    register_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER' COMMENT '角色分类(USER/MERCHANT/ADMIN)',
    PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户基础表';

-- 2. Service Item Table
CREATE TABLE IF NOT EXISTS T_Service (
    service_id   INT AUTO_INCREMENT COMMENT '服务项目唯一标识',
    service_name VARCHAR(100) NOT NULL COMMENT '服务名称',
    description  TEXT COMMENT '服务详细描述',
    price        DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '服务收费价格',
    category     VARCHAR(50) COMMENT '服务分类',
    merchant_id  INT NOT NULL COMMENT '发布服务的商家用户ID',
    PRIMARY KEY (service_id),
    CONSTRAINT fk_service_merchant FOREIGN KEY (merchant_id) REFERENCES T_User(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务项目表';

-- 3. Service Schedule Table
CREATE TABLE IF NOT EXISTS T_Schedule (
    schedule_id  INT AUTO_INCREMENT COMMENT '排班唯一标识',
    service_id   INT NOT NULL COMMENT '关联的服务ID',
    start_time   DATETIME NOT NULL COMMENT '排班开始时间',
    end_time     DATETIME NOT NULL COMMENT '排班结束时间',
    capacity     INT NOT NULL DEFAULT 1 COMMENT '该时段最大可预约人数上限',
    booked_count INT NOT NULL DEFAULT 0 COMMENT '已预约成功名额',
    PRIMARY KEY (schedule_id),
    CONSTRAINT fk_schedule_service FOREIGN KEY (service_id) REFERENCES T_Service(service_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排班名额时间段表';

-- 4. Appointment Order Table
CREATE TABLE IF NOT EXISTS T_Appointment (
    appointment_id INT AUTO_INCREMENT COMMENT '预约订单唯一标识',
    user_id        INT NOT NULL COMMENT '预约的普通用户ID',
    service_id     INT NOT NULL COMMENT '预约的服务ID',
    schedule_id    INT NOT NULL COMMENT '预约的排班时段ID',
    status         TINYINT NOT NULL DEFAULT 1 COMMENT '状态码(1待确认 2已确认 3已拒绝 4已取消 5已完成)',
    create_time    DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
    PRIMARY KEY (appointment_id),
    CONSTRAINT fk_appointment_user     FOREIGN KEY (user_id)     REFERENCES T_User(user_id)     ON DELETE CASCADE,
    CONSTRAINT fk_appointment_service  FOREIGN KEY (service_id)  REFERENCES T_Service(service_id) ON DELETE CASCADE,
    CONSTRAINT fk_appointment_schedule FOREIGN KEY (schedule_id) REFERENCES T_Schedule(schedule_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约订单流水表';

-- 5. Comment & Review Table
CREATE TABLE IF NOT EXISTS T_Comment (
    comment_id     INT AUTO_INCREMENT COMMENT '评价唯一标识',
    appointment_id INT NOT NULL UNIQUE COMMENT '关联的预约订单ID',
    rating_star    TINYINT NOT NULL DEFAULT 5 COMMENT '评价星级(1至5星)',
    content        TEXT COMMENT '评语详细文本内容',
    comment_time   DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发表时间',
    PRIMARY KEY (comment_id),
    CONSTRAINT fk_comment_appointment FOREIGN KEY (appointment_id) REFERENCES T_Appointment(appointment_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户服务评价表';
