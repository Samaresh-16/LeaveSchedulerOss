package com.sap.fsad.leaveApp.exception;

import com.sap.fsad.leaveApp.dto.response.CustomErrorResponse;

import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.LockTimeoutException;
import jakarta.persistence.OptimisticLockException;
import jakarta.persistence.PessimisticLockException;
import jakarta.validation.ConstraintViolationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.ConversionNotSupportedException;
import org.springframework.beans.TypeMismatchException;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.core.convert.ConversionFailedException;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageConversionException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AccountExpiredException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.validation.BindException;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingPathVariableException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.UnsatisfiedServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.context.request.async.AsyncRequestTimeoutException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

        private final Logger logger = LoggerFactory.getLogger(this.getClass());

        private CustomErrorResponse build(LocalDateTime time, String msg, String details) {
                return new CustomErrorResponse(time, msg, details);
        }

        @ExceptionHandler(HttpServerErrorException.class)
        public ResponseEntity<CustomErrorResponse> handleHttpServerError(HttpServerErrorException ex,
                        WebRequest request) {
                logger.error("Downstream Server Error: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(),
                                                "Downstream service unavailable: " + ex.getStatusCode().value(),
                                                request.getDescription(false)),
                                ex.getStatusCode());
        }

        @ExceptionHandler(RestClientException.class)
        public ResponseEntity<CustomErrorResponse> handleRestClientException(RestClientException ex,
                        WebRequest request) {
                logger.error("REST Client Error: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "External service communication error",
                                                request.getDescription(false)),
                                HttpStatus.BAD_GATEWAY);
        }

        @ExceptionHandler(ResourceAccessException.class)
        public ResponseEntity<CustomErrorResponse> handleResourceAccessException(ResourceAccessException ex,
                        WebRequest request) {
                logger.error("Resource Access Error: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Service temporarily unavailable",
                                                request.getDescription(false)),
                                HttpStatus.SERVICE_UNAVAILABLE);
        }

        @ExceptionHandler(NoHandlerFoundException.class)
        public ResponseEntity<CustomErrorResponse> handleNoHandlerFound(NoHandlerFoundException ex,
                        WebRequest request) {
                logger.error("No Handler Found: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Endpoint not found: " + ex.getRequestURL(),
                                                request.getDescription(false)),
                                HttpStatus.NOT_FOUND);
        }

        // Enhanced Security Exceptions
        @ExceptionHandler(InsufficientAuthenticationException.class)
        public ResponseEntity<CustomErrorResponse> handleInsufficientAuthentication(
                        InsufficientAuthenticationException ex,
                        WebRequest request) {
                logger.error("Insufficient Authentication: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Authentication required",
                                                request.getDescription(false)),
                                HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(DisabledException.class)
        public ResponseEntity<CustomErrorResponse> handleAccountDisabled(DisabledException ex,
                        WebRequest request) {
                logger.error("Account Disabled: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Account is disabled",
                                                request.getDescription(false)),
                                HttpStatus.FORBIDDEN);
        }

        @ExceptionHandler(LockedException.class)
        public ResponseEntity<CustomErrorResponse> handleAccountLocked(LockedException ex,
                        WebRequest request) {
                logger.error("Account Locked: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Account is locked",
                                                request.getDescription(false)),
                                HttpStatus.LOCKED);
        }

        @ExceptionHandler(AccountExpiredException.class)
        public ResponseEntity<CustomErrorResponse> handleAccountExpired(AccountExpiredException ex,
                        WebRequest request) {
                logger.error("Account Expired: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Account has expired",
                                                request.getDescription(false)),
                                HttpStatus.FORBIDDEN);
        }

        @ExceptionHandler(CredentialsExpiredException.class)
        public ResponseEntity<CustomErrorResponse> handleCredentialsExpired(CredentialsExpiredException ex,
                        WebRequest request) {
                logger.error("Credentials Expired: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Credentials have expired",
                                                request.getDescription(false)),
                                HttpStatus.UNAUTHORIZED);
        }

        // Enhanced Data Access Exceptions
        @ExceptionHandler(DuplicateKeyException.class)
        public ResponseEntity<CustomErrorResponse> handleDuplicateKey(DuplicateKeyException ex,
                        WebRequest request) {
                logger.error("Duplicate Key: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Duplicate entry detected",
                                                request.getDescription(false)),
                                HttpStatus.CONFLICT);
        }

        @ExceptionHandler(EmptyResultDataAccessException.class)
        public ResponseEntity<CustomErrorResponse> handleEmptyResult(EmptyResultDataAccessException ex,
                        WebRequest request) {
                logger.error("Empty Result: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "No data found",
                                                request.getDescription(false)),
                                HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(InvalidDataAccessApiUsageException.class)
        public ResponseEntity<CustomErrorResponse> handleInvalidDataAccess(InvalidDataAccessApiUsageException ex,
                        WebRequest request) {
                logger.error("Invalid Data Access: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Invalid data access operation",
                                                request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(CannotCreateTransactionException.class)
        public ResponseEntity<CustomErrorResponse> handleCannotCreateTransaction(CannotCreateTransactionException ex,
                        WebRequest request) {
                logger.error("Cannot Create Transaction: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Database connection error",
                                                request.getDescription(false)),
                                HttpStatus.SERVICE_UNAVAILABLE);
        }

        // Network and Timeout Exceptions
        @ExceptionHandler(ConnectException.class)
        public ResponseEntity<CustomErrorResponse> handleConnectException(ConnectException ex,
                        WebRequest request) {
                logger.error("Connection Error: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Unable to connect to external service",
                                                request.getDescription(false)),
                                HttpStatus.BAD_GATEWAY);
        }

        @ExceptionHandler(SocketTimeoutException.class)
        public ResponseEntity<CustomErrorResponse> handleSocketTimeout(SocketTimeoutException ex,
                        WebRequest request) {
                logger.error("Socket Timeout: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Request timed out",
                                                request.getDescription(false)),
                                HttpStatus.GATEWAY_TIMEOUT);
        }

        @ExceptionHandler(TimeoutException.class)
        public ResponseEntity<CustomErrorResponse> handleTimeout(TimeoutException ex,
                        WebRequest request) {
                logger.error("Timeout: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Operation timed out",
                                                request.getDescription(false)),
                                HttpStatus.REQUEST_TIMEOUT);
        }

        // Additional Conversion and Binding Exceptions
        @ExceptionHandler(ConversionFailedException.class)
        public ResponseEntity<CustomErrorResponse> handleConversionFailed(ConversionFailedException ex,
                        WebRequest request) {
                logger.error("Conversion Failed: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Data conversion error",
                                                request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(WebExchangeBindException.class)
        public ResponseEntity<CustomErrorResponse> handleWebExchangeBind(WebExchangeBindException ex,
                        WebRequest request) {
                logger.error("Web Exchange Bind: {}", ex.getMessage());
                String errors = ex.getAllErrors()
                                .stream()
                                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                                .collect(Collectors.joining(", "));
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Request binding failed: " + errors,
                                                request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        // Security Token Exceptions
        @ExceptionHandler(io.jsonwebtoken.JwtException.class)
        public ResponseEntity<CustomErrorResponse> handleJwtException(io.jsonwebtoken.JwtException ex,
                        WebRequest request) {
                logger.error("JWT Error: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Invalid or expired token",
                                                request.getDescription(false)),
                                HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(io.jsonwebtoken.ExpiredJwtException.class)
        public ResponseEntity<CustomErrorResponse> handleExpiredJwt(io.jsonwebtoken.ExpiredJwtException ex,
                        WebRequest request) {
                logger.error("JWT Expired: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Token has expired",
                                                request.getDescription(false)),
                                HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(io.jsonwebtoken.MalformedJwtException.class)
        public ResponseEntity<CustomErrorResponse> handleMalformedJwt(io.jsonwebtoken.MalformedJwtException ex,
                        WebRequest request) {
                logger.error("Malformed JWT: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Invalid token format",
                                                request.getDescription(false)),
                                HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(io.jsonwebtoken.UnsupportedJwtException.class)
        public ResponseEntity<CustomErrorResponse> handleUnsupportedJwt(io.jsonwebtoken.UnsupportedJwtException ex,
                        WebRequest request) {
                logger.error("Unsupported JWT: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Unsupported token",
                                                request.getDescription(false)),
                                HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(io.jsonwebtoken.security.SignatureException.class)
        public ResponseEntity<CustomErrorResponse> handleSignatureException(
                        io.jsonwebtoken.security.SignatureException ex,
                        WebRequest request) {
                logger.error("JWT Signature Error: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Invalid token signature",
                                                request.getDescription(false)),
                                HttpStatus.UNAUTHORIZED);
        }

        // File and I/O Exceptions
        @ExceptionHandler(java.io.IOException.class)
        public ResponseEntity<CustomErrorResponse> handleIOException(java.io.IOException ex,
                        WebRequest request) {
                logger.error("I/O Error: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "File processing error",
                                                request.getDescription(false)),
                                HttpStatus.INTERNAL_SERVER_ERROR);
        }

        @ExceptionHandler(java.nio.file.NoSuchFileException.class)
        public ResponseEntity<CustomErrorResponse> handleNoSuchFile(java.nio.file.NoSuchFileException ex,
                        WebRequest request) {
                logger.error("File Not Found: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "File not found",
                                                request.getDescription(false)),
                                HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
        public ResponseEntity<CustomErrorResponse> handleNotAcceptable(HttpMediaTypeNotAcceptableException ex,
                        WebRequest request) {
                logger.error("Not Acceptable: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Requested media type not acceptable",
                                                request.getDescription(false)),
                                HttpStatus.NOT_ACCEPTABLE);
        }

        @ExceptionHandler(MissingRequestHeaderException.class)
        public ResponseEntity<CustomErrorResponse> handleMissingHeader(MissingRequestHeaderException ex,
                        WebRequest request) {
                logger.error("Missing Header: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Missing required header: " + ex.getHeaderName(),
                                                request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(UnsatisfiedServletRequestParameterException.class)
        public ResponseEntity<CustomErrorResponse> handleUnsatisfiedParams(
                        UnsatisfiedServletRequestParameterException ex,
                        WebRequest request) {
                logger.error("Unsatisfied Params: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Unsatisfied request parameters: " + ex.getParamConditions(),
                                                request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(HttpMessageConversionException.class)
        public ResponseEntity<CustomErrorResponse> handleMessageConversion(HttpMessageConversionException ex,
                        WebRequest request) {
                logger.error("Message Conversion: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Failed to convert request body",
                                                request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<CustomErrorResponse> handleResponseStatus(ResponseStatusException ex,
                        WebRequest request) {
                logger.error("ResponseStatusException: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), ex.getReason() != null ? ex.getReason()
                                                : "Request error", request.getDescription(false)),
                                ex.getStatusCode());
        }

        @ExceptionHandler(HttpClientErrorException.class)
        public ResponseEntity<CustomErrorResponse> handleHttpClientError(HttpClientErrorException ex,
                        WebRequest request) {
                logger.error("Downstream Client Error: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Downstream service error: " + ex.getStatusCode().value(),
                                                request.getDescription(false)),
                                ex.getStatusCode());
        }

        @ExceptionHandler(RateLimitExceededException.class)
        public ResponseEntity<CustomErrorResponse> handleRateLimit(RateLimitExceededException ex, WebRequest request) {
                logger.warn("Rate Limit: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), ex.getMessage(), request.getDescription(false)),
                                HttpStatus.TOO_MANY_REQUESTS);
        }

        @ExceptionHandler({ OptimisticLockException.class, ObjectOptimisticLockingFailureException.class })
        public ResponseEntity<CustomErrorResponse> handleOptimisticLock(Exception ex, WebRequest request) {
                logger.error("Optimistic Lock: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Conflict: concurrent update detected",
                                                request.getDescription(false)),
                                HttpStatus.CONFLICT);
        }

        @ExceptionHandler({ PessimisticLockException.class, CannotAcquireLockException.class,
                        LockTimeoutException.class })
        public ResponseEntity<CustomErrorResponse> handlePessimisticLock(Exception ex, WebRequest request) {
                logger.error("Lock Acquisition: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Resource is locked, please retry",
                                                request.getDescription(false)),
                                HttpStatus.LOCKED);
        }

        @ExceptionHandler(ResourceLockedException.class)
        public ResponseEntity<CustomErrorResponse> handleResourceLocked(ResourceLockedException ex,
                        WebRequest request) {
                logger.error("Resource Locked: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), ex.getMessage(), request.getDescription(false)),
                                HttpStatus.LOCKED);
        }

        @ExceptionHandler(EmailSendException.class)
        public ResponseEntity<CustomErrorResponse> handleEmailSend(EmailSendException ex, WebRequest request) {
                logger.error("Email Send Error: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Email service error: " + ex.getMessage(),
                                                request.getDescription(false)),
                                HttpStatus.SERVICE_UNAVAILABLE);
        }

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<CustomErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex,
                        WebRequest request) {
                logger.error("Resource Not Found: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), ex.getMessage(), request.getDescription(false)),
                                HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<CustomErrorResponse> handleBadRequestException(BadRequestException ex,
                        WebRequest request) {
                logger.error("Bad Request: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), ex.getMessage(), request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<CustomErrorResponse> handleAuthenticationException(AuthenticationException ex,
                        WebRequest request) {
                logger.error("Custom Authentication: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), ex.getMessage(), request.getDescription(false)),
                                HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<CustomErrorResponse> handleBadCredentialsException(BadCredentialsException ex,
                        WebRequest request) {
                logger.error("Bad Credentials: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Invalid username or password",
                                                request.getDescription(false)),
                                HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(UsernameNotFoundException.class)
        public ResponseEntity<CustomErrorResponse> handleUsernameNotFound(UsernameNotFoundException ex,
                        WebRequest request) {
                logger.error("Username Not Found: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "User not found", request.getDescription(false)),
                                HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<CustomErrorResponse> handleAccessDeniedException(AccessDeniedException ex,
                        WebRequest request) {
                logger.error("Access Denied: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(),
                                                "Access denied. You don't have permission to access this resource",
                                                request.getDescription(false)),
                                HttpStatus.FORBIDDEN);
        }

        // Validation (bean)
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<CustomErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex,
                        WebRequest request) {
                logger.error("Validation Exception: {}", ex.getMessage());
                String errors = ex.getBindingResult()
                                .getAllErrors()
                                .stream()
                                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                                .collect(Collectors.joining(", "));
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Validation failed: " + errors,
                                                request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        // Validation (request parameters / path variables)
        @ExceptionHandler(ConstraintViolationException.class)
        public ResponseEntity<CustomErrorResponse> handleConstraintViolation(ConstraintViolationException ex,
                        WebRequest request) {
                logger.error("Constraint Violation: {}", ex.getMessage());
                String errors = ex.getConstraintViolations()
                                .stream()
                                .map(v -> v.getPropertyPath() + " " + v.getMessage())
                                .collect(Collectors.joining(", "));
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Constraint violation: " + errors,
                                                request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(BindException.class)
        public ResponseEntity<CustomErrorResponse> handleBindException(BindException ex, WebRequest request) {
                logger.error("Bind Exception: {}", ex.getMessage());
                String errors = ex.getAllErrors()
                                .stream()
                                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                                .collect(Collectors.joining(", "));
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Binding failed: " + errors, request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        // HTTP / request issues
        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<CustomErrorResponse> handleNotReadable(HttpMessageNotReadableException ex,
                        WebRequest request) {
                logger.error("Message Not Readable: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Malformed JSON request", request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
        public ResponseEntity<CustomErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex,
                        WebRequest request) {
                logger.error("Method Not Supported: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Method not allowed", request.getDescription(false)),
                                HttpStatus.METHOD_NOT_ALLOWED);
        }

        @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
        public ResponseEntity<CustomErrorResponse> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex,
                        WebRequest request) {
                logger.error("Media Type Not Supported: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Unsupported media type", request.getDescription(false)),
                                HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        }

        @ExceptionHandler(MissingServletRequestParameterException.class)
        public ResponseEntity<CustomErrorResponse> handleMissingParam(MissingServletRequestParameterException ex,
                        WebRequest request) {
                logger.error("Missing Parameter: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Missing required parameter: " + ex.getParameterName(),
                                                request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(MissingPathVariableException.class)
        public ResponseEntity<CustomErrorResponse> handleMissingPathVar(MissingPathVariableException ex,
                        WebRequest request) {
                logger.error("Missing Path Variable: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Missing path variable: " + ex.getVariableName(),
                                                request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(ServletRequestBindingException.class)
        public ResponseEntity<CustomErrorResponse> handleServletBinding(ServletRequestBindingException ex,
                        WebRequest request) {
                logger.error("Servlet Request Binding: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Request binding error: " + ex.getMessage(),
                                                request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<CustomErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
                        WebRequest request) {
                logger.error("Argument Type Mismatch: {}", ex.getMessage());
                String msg = "Parameter '" + ex.getName() + "' has invalid value '" + ex.getValue() + "'";
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), msg, request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(TypeMismatchException.class)
        public ResponseEntity<CustomErrorResponse> handleSpringTypeMismatch(TypeMismatchException ex,
                        WebRequest request) {
                logger.error("Type Mismatch: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(),
                                                "Type mismatch for property '" + ex.getPropertyName() + "'",
                                                request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        // Persistence / data
        @ExceptionHandler(EntityNotFoundException.class)
        public ResponseEntity<CustomErrorResponse> handleEntityNotFound(EntityNotFoundException ex,
                        WebRequest request) {
                logger.error("Entity Not Found: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Entity not found", request.getDescription(false)),
                                HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(NoSuchElementException.class)
        public ResponseEntity<CustomErrorResponse> handleNoSuchElement(NoSuchElementException ex,
                        WebRequest request) {
                logger.error("No Such Element: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Requested element not found",
                                                request.getDescription(false)),
                                HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<CustomErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex,
                        WebRequest request) {
                logger.error("Data Integrity Violation: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Data integrity violation", request.getDescription(false)),
                                HttpStatus.CONFLICT);
        }

        // General argument/state
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<CustomErrorResponse> handleIllegalArgument(IllegalArgumentException ex,
                        WebRequest request) {
                logger.error("Illegal Argument: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), ex.getMessage(), request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<CustomErrorResponse> handleIllegalState(IllegalStateException ex,
                        WebRequest request) {
                logger.error("Illegal State: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), ex.getMessage(), request.getDescription(false)),
                                HttpStatus.CONFLICT);
        }

        // Conversion / multipart / async
        @ExceptionHandler(ConversionNotSupportedException.class)
        public ResponseEntity<CustomErrorResponse> handleConversionNotSupported(ConversionNotSupportedException ex,
                        WebRequest request) {
                logger.error("Conversion Not Supported: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Conversion error", request.getDescription(false)),
                                HttpStatus.INTERNAL_SERVER_ERROR);
        }

        @ExceptionHandler(AsyncRequestTimeoutException.class)
        public ResponseEntity<CustomErrorResponse> handleAsyncTimeout(AsyncRequestTimeoutException ex,
                        WebRequest request) {
                logger.error("Async Timeout: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Request timed out", request.getDescription(false)),
                                HttpStatus.SERVICE_UNAVAILABLE);
        }

        @ExceptionHandler(MaxUploadSizeExceededException.class)
        public ResponseEntity<CustomErrorResponse> handleMaxUpload(MaxUploadSizeExceededException ex,
                        WebRequest request) {
                logger.error("Max Upload Size Exceeded: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Uploaded file too large", request.getDescription(false)),
                                HttpStatus.PAYLOAD_TOO_LARGE);
        }

        @ExceptionHandler(MultipartException.class)
        public ResponseEntity<CustomErrorResponse> handleMultipart(MultipartException ex,
                        WebRequest request) {
                logger.error("Multipart Error: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "Multipart request error", request.getDescription(false)),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(NoResourceFoundException.class)
        public ResponseEntity<CustomErrorResponse> handleNoResourceFound(NoResourceFoundException ex,
                        WebRequest request) {
                logger.error("No Resource Found: {}", ex.getMessage());
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "API endpoint not found: " + ex.getResourcePath(),
                                                request.getDescription(false)),
                                HttpStatus.NOT_FOUND);
        }

        // Fallback
        @ExceptionHandler(Exception.class)
        public ResponseEntity<CustomErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
                logger.error("Unhandled Exception: {}", ex.getMessage(), ex);
                return new ResponseEntity<>(
                                build(LocalDateTime.now(), "An unexpected error occurred",
                                                request.getDescription(false)),
                                HttpStatus.INTERNAL_SERVER_ERROR);
        }
}