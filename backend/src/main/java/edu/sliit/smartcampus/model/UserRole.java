package edu.sliit.smartcampus.model;

public enum UserRole {
    USER,
    STUDENT,
    ADMIN,
    TECHNICIAN;

    public UserRole effectiveRole() {
        return this == STUDENT ? USER : this;
    }

    public String effectiveRoleName() {
        return effectiveRole().name();
    }
}
