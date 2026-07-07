package com.booking.dto;

import lombok.Data;

@Data
public class ServiceListQuery {
    private String keyword;
    private String category;
    private String sortBy;  // price or rating
}
