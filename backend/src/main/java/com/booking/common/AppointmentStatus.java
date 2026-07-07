package com.booking.common;

/**
 * Appointment status constants — matching the SRS data dictionary.
 * <p>
 * 单字符编码: 1=待确认, 2=已确认, 3=已拒绝, 4=已取消, 5=已完成
 */
public final class AppointmentStatus {

    private AppointmentStatus() {}

    /** 待确认 — 用户提交预约，等待商家审核 */
    public static final int PENDING = 1;

    /** 已确认 — 商家已审核通过，预约生效 */
    public static final int CONFIRMED = 2;

    /** 已拒绝 — 商家拒绝该预约 */
    public static final int REJECTED = 3;

    /** 已取消 — 用户主动取消预约 */
    public static final int CANCELLED = 4;

    /** 已完成 — 服务已顺利提供完毕 */
    public static final int COMPLETED = 5;
}
