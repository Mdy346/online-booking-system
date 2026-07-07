package com.booking.controller;

import com.booking.common.ApiResponse;
import com.booking.dto.SubmitCommentRequest;
import com.booking.entity.Comment;
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

    @PostMapping
    public ApiResponse<Comment> submit(@Valid @RequestBody SubmitCommentRequest req) {
        Comment comment = new Comment();
        comment.setAppointmentId(req.getAppointmentId());
        comment.setRatingStar(req.getRatingStar());
        comment.setContent(req.getContent());
        comment.setCommentTime(LocalDateTime.now());
        commentMapper.insert(comment);
        return ApiResponse.success("评价成功", comment);
    }
}
