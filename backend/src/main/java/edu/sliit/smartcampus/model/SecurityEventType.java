package edu.sliit.smartcampus.model;

public enum SecurityEventType {
    LOGIN_SUCCESS,
    LOGIN_FAILED,
    LOGOUT,
    TOKEN_REFRESH,
    OAUTH_LOGIN,
    PASSWORD_CHANGED,
    ROLE_CHANGED,
    SUSPICIOUS_LOGIN
}
