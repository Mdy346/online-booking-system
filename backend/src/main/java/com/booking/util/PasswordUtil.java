package com.booking.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * SHA-256 password hashing utility (per SRS data dictionary spec).
 */
public final class PasswordUtil {

    private PasswordUtil() {}

    /** Hash password with SHA-256, returns 64-char hex string. */
    public static String hash(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes());
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b & 0xff));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    /** Verify that a plaintext password matches the stored hash. */
    public static boolean verify(String password, String storedHash) {
        return hash(password).equals(storedHash);
    }
}
