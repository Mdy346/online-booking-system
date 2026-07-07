package com.booking.controller;

import com.booking.common.ApiResponse;
import com.booking.service.StatsService;
import com.booking.service.StatsService.MerchantStatsVo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/merchant/{merchantId}")
    public ApiResponse<MerchantStatsVo> getMerchantStats(@PathVariable Integer merchantId) {
        MerchantStatsVo stats = statsService.getMerchantStats(merchantId);
        return ApiResponse.success(stats);
    }
}

