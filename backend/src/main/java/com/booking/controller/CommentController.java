package com.booking.controller;

import com.booking.common.ApiResponse;
import com.booking.common.AppointmentStatus;
import com.booking.common.BusinessException;
import com.booking.dto.SubmitCommentRequest;
import com.booking.entity.Appointment;
import com.booking.entity.Comment;
import com.booking.mapper.AppointmentMapper;
import com.booking.mapper.CommentMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentMapper commentMapper;
    private final AppointmentMapper appointmentMapper;

    @PostMapping
    public ApiResponse<Comment> submit(@Valid @RequestBody SubmitCommentRequest req) {
        // 验证预约已完成
        Appointment appointment = appointmentMapper.selectById(req.getAppointmentId());
        if (appointment == null) {
            throw BusinessException.notFound("预约订单");
        }
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw BusinessException.conflict("服务还未完成，暂不能评价");
        }

        Comment comment = new Comment();
        comment.setAppointmentId(req.getAppointmentId());
        comment.setRatingStar(req.getRatingStar());
        comment.setContent(req.getContent());
        comment.setCommentTime(LocalDateTime.now());
        commentMapper.insert(comment);
        return ApiResponse.success("评价成功", comment);
    }
}
