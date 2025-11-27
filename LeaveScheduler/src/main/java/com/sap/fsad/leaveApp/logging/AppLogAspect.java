package com.sap.fsad.leaveApp.logging;

import java.lang.reflect.Method;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import com.sap.fsad.leaveApp.service.AppLogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Aspect
@RequiredArgsConstructor
@Slf4j
public class AppLogAspect {

    private final AppLogService appLogService;

    // Removed generic controller aspect to prevent duplicate logging
    // Only using @LogOperation specific aspect for precise control

    /**
     * Extract entity ID from method parameters (looking for @PathVariable with
     * common ID names)
     */
    private String extractEntityId(ProceedingJoinPoint joinPoint) {
        try {
            Method method = getMethod(joinPoint);
            if (method == null) {
                return null;
            }

            Object[] args = joinPoint.getArgs();

            for (int i = 0; i < method.getParameters().length; i++) {
                if (method.getParameters()[i].isAnnotationPresent(PathVariable.class)) {
                    PathVariable pathVar = method.getParameters()[i].getAnnotation(PathVariable.class);
                    String varName = pathVar.value().isEmpty() ? pathVar.name() : pathVar.value();

                    // Check if it's likely an ID parameter
                    if ((varName.toLowerCase().contains("id") ||
                            varName.equalsIgnoreCase("id") ||
                            varName.toLowerCase().endsWith("id")) && args[i] != null) {
                        return args[i].toString();
                    }
                }
            }

            // Fallback: look for any parameter named 'id' in method signature
            for (int i = 0; i < method.getParameters().length; i++) {
                String paramName = method.getParameters()[i].getName();
                if ((paramName.equalsIgnoreCase("id") || paramName.toLowerCase().endsWith("id"))
                        && args[i] != null) {
                    return args[i].toString();
                }
            }
        } catch (Exception e) {
            // Ignore extraction errors
        }
        return null;
    }

    /**
     * Extract request body from method parameters
     */
    private Object extractRequestBody(ProceedingJoinPoint joinPoint) {
        try {
            Method method = getMethod(joinPoint);
            Object[] args = joinPoint.getArgs();

            for (int i = 0; i < method.getParameters().length; i++) {
                if (method.getParameters()[i].isAnnotationPresent(RequestBody.class)) {
                    return args[i];
                }
            }
        } catch (Exception e) {
            // Ignore extraction errors
        }
        return null;
    }

    /**
     * Extract response body from result
     */
    private Object extractResponseBody(Object result) {
        try {
            if (result instanceof ResponseEntity) {
                return ((ResponseEntity<?>) result).getBody();
            }
            return result;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Get the actual method being invoked
     */
    private Method getMethod(ProceedingJoinPoint joinPoint) {
        try {
            // For Spring AOP, we need to get the method from the method signature
            if (joinPoint.getSignature() instanceof MethodSignature) {
                MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();
                return methodSignature.getMethod();
            }

            // Fallback: try to get method by name and parameter types
            String methodName = joinPoint.getSignature().getName();
            Class<?>[] parameterTypes = new Class<?>[joinPoint.getArgs().length];

            // Handle null arguments by getting parameter types from signature if possible
            Object[] args = joinPoint.getArgs();
            for (int i = 0; i < args.length; i++) {
                if (args[i] != null) {
                    parameterTypes[i] = args[i].getClass();
                } else {
                    // For null arguments, we'll try to find the method by name only later
                    parameterTypes[i] = Object.class;
                }
            }

            return joinPoint.getTarget().getClass().getMethod(methodName, parameterTypes);
        } catch (Exception e) {
            // Final fallback: try to find method by name only (may not be unique)
            try {
                String methodName = joinPoint.getSignature().getName();
                Method[] methods = joinPoint.getTarget().getClass().getMethods();
                for (Method method : methods) {
                    if (method.getName().equals(methodName) &&
                            method.getParameterCount() == joinPoint.getArgs().length) {
                        return method;
                    }
                }
            } catch (Exception ex) {
                log.warn("Could not get method for logging: {}", ex.getMessage());
            }
            return null;
        }
    }

    /**
     * Pointcut for methods annotated with @LogOperation
     */
    @Pointcut("@annotation(com.sap.fsad.leaveApp.logging.LogOperation)")
    public void logOperationMethods() {
    }

    /**
     * Around advice for methods with custom @LogOperation annotation
     */
    @Around("logOperationMethods() && @annotation(logOperation)")
    public Object logCustomOperations(ProceedingJoinPoint joinPoint, LogOperation logOperation) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = null;
        Throwable error = null;

        Object requestBody = null;
        if (logOperation.includeRequestBody()) {
            requestBody = extractRequestBody(joinPoint);
        }

        String entityId = extractEntityId(joinPoint);

        // Extract HTTP method, request URI, and other details from current request
        String httpMethod = null;
        String requestUri = null;
        String ipAddress = null;
        String userAgent = null;
        String correlationId = null;
        try {
            org.springframework.web.context.request.ServletRequestAttributes attrs = (org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder
                    .currentRequestAttributes();
            if (attrs != null && attrs.getRequest() != null) {
                jakarta.servlet.http.HttpServletRequest request = attrs.getRequest();
                httpMethod = request.getMethod();
                requestUri = request.getRequestURI();
                ipAddress = getClientIpAddress(request);
                userAgent = request.getHeader("User-Agent");
                correlationId = getOrCreateCorrelationId(request);
            }
        } catch (Exception e) {
            // Ignore if no request context available
        }

        // If entityType is empty, try to infer from operation name or request URI
        String effectiveEntityType = logOperation.entityType();
        if (effectiveEntityType == null || effectiveEntityType.trim().isEmpty()) {
            effectiveEntityType = inferEntityTypeFromOperation(logOperation.value(), requestUri);
        }

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Throwable t) {
            error = t;
            throw t;
        } finally {
            long executionTime = System.currentTimeMillis() - startTime;
            String status = error == null ? "SUCCESS" : "FAILURE";
            String message = error == null ? "Operation completed successfully" : error.getMessage();

            Object responseBody = null;
            if (logOperation.includeResponseBody() && result != null) {
                responseBody = extractResponseBody(result);
            }

            if (logOperation.async()) {
                appLogService.logWithFullContext(logOperation.value(), effectiveEntityType,
                        entityId, status, message, requestBody, responseBody, executionTime,
                        httpMethod, requestUri, ipAddress, userAgent, correlationId);
            } else {
                appLogService.logSyncWithContext(logOperation.value(), effectiveEntityType,
                        entityId, status, message, httpMethod, requestUri);
            }
        }
    }

    /**
     * Infer entity type from operation name or request URI
     */
    private String inferEntityTypeFromOperation(String operation, String requestUri) {
        if (operation == null) {
            return "";
        }

        String op = operation.toUpperCase();

        // Map common operations to entity types
        if (op.contains("USER"))
            return "User";
        if (op.contains("LEAVE"))
            return "Leave";
        if (op.contains("HOLIDAY"))
            return "Holiday";
        if (op.contains("NOTIFICATION"))
            return "Notification";
        if (op.contains("APPROVAL"))
            return "LeaveApplication";
        if (op.contains("REPORT"))
            return "Report";
        if (op.contains("ADMIN"))
            return "Admin";

        // Try to infer from request URI if available
        if (requestUri != null) {
            String uri = requestUri.toLowerCase();
            if (uri.contains("/users"))
                return "User";
            if (uri.contains("/leaves") || uri.contains("/leave"))
                return "Leave";
            if (uri.contains("/holidays"))
                return "Holiday";
            if (uri.contains("/notifications"))
                return "Notification";
            if (uri.contains("/approval"))
                return "LeaveApplication";
            if (uri.contains("/reports"))
                return "Report";
        }

        return ""; // Return empty string if can't infer
    }

    /**
     * Get client IP address from HTTP request
     */
    private String getClientIpAddress(jakarta.servlet.http.HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    /**
     * Get or create correlation ID for request tracing
     */
    private String getOrCreateCorrelationId(jakarta.servlet.http.HttpServletRequest request) {
        String correlationId = request.getHeader("X-Correlation-ID");
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = java.util.UUID.randomUUID().toString();
        }
        return correlationId;
    }
}