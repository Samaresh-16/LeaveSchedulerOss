package com.sap.fsad.leaveApp.logging;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark methods that should be logged with custom operation names
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface LogOperation {
    String value(); // operation name

    String entityType() default ""; // entity type being operated on

    boolean includeRequestBody() default true;

    boolean includeResponseBody() default true;

    boolean async() default true; // whether to log asynchronously
}