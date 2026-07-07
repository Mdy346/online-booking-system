package com.booking.common;

import lombok.Getter;

/**
 * Custom business exception.
 * Thrown by service layer for expected error scenarios.
 */
@Getter
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(String message) {
        this(400, message);
    }

    /** 预约时段已满 */
    public static BusinessException slotFull() {
        return new BusinessException(400, "当前时段预约名额已售罄，请重新选择其他时段");
    }

    /** 预约不存在 */
    public static BusinessEntityNotFoundException notFound(String entity) {
        return new BusinessEntityNotFoundException(entity + "不存在");
    }

    /** 无权限 */
    public static BusinessException forbidden() {
        return new BusinessException(403, "无权限执行此操作");
    }

    /** 登录失败 */
    public static BusinessException loginFailed() {
        return new BusinessException(401, "账号或密码错误");
    }

    /** 冲突状态 */
    public static BusinessException conflict(String message) {
        return new BusinessException(409, message);
    }

    public static class BusinessEntityNotFoundException extends BusinessException {
        public BusinessEntityNotFoundException(String message) {
            super(404, message);
        }
    }
}
