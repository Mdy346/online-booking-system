package com.booking.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VerificationCodeService {

    private final Map<String, CodeEntry> codeStore = new ConcurrentHashMap<>();
    private final Random random = new Random();

    private static final long CODE_TTL_MS = 5 * 60 * 1000; // 5 minutes

    /** Generate and "send" a 6-digit code to the given phone. */
    public String sendCode(String phone) {
        String code = String.format("%06d", random.nextInt(1000000));
        codeStore.put(phone, new CodeEntry(code, System.currentTimeMillis() + CODE_TTL_MS));
        // In production, send via SMS gateway here. In dev mode, just log it.
        System.out.println("[DEV] Verification code for " + phone + ": " + code);
        return code;
    }

    /** Verify the code for the given phone. Returns true if valid. */
    public boolean verifyCode(String phone, String code) {
        CodeEntry entry = codeStore.get(phone);
        if (entry == null) return false;
        if (System.currentTimeMillis() > entry.expireAt) {
            codeStore.remove(phone);
            return false;
        }
        boolean match = entry.code.equals(code);
        if (match) codeStore.remove(phone); // one-time use
        return match;
    }

    private record CodeEntry(String code, long expireAt) {}
}
