package com.sap.fsad.leaveApp.config;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BindException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;

import com.sap.fsad.leaveApp.exception.AuthenticationException;
import com.sap.fsad.leaveApp.exception.BadRequestException;
import com.sap.fsad.leaveApp.exception.EmailSendException;
import com.sap.fsad.leaveApp.exception.RateLimitExceededException;
import com.sap.fsad.leaveApp.exception.ResourceLockedException;
import com.sap.fsad.leaveApp.exception.ResourceNotFoundException;

import graphql.GraphQLError;
import graphql.language.StringValue;
import graphql.scalars.ExtendedScalars;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import graphql.schema.DataFetchingEnvironment;
import graphql.schema.GraphQLScalarType;

@Configuration
public class GraphQLConfig {

    @Bean
    RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return builder -> builder
                .scalar(ExtendedScalars.Json)
                .scalar(ExtendedScalars.Date)
                .scalar(localDateTimeScalar());
    }

    @Bean
    public GraphQLScalarType localDateTimeScalar() {
        return GraphQLScalarType.newScalar()
                .name("DateTime")
                .description("Java LocalDateTime as scalar")
                .coercing(new Coercing<LocalDateTime, String>() {
                    @Override
                    public String serialize(Object dataFetcherResult) throws CoercingSerializeException {
                        if (dataFetcherResult instanceof LocalDateTime) {
                            return ((LocalDateTime) dataFetcherResult).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                        }
                        throw new CoercingSerializeException("Expected a LocalDateTime object.");
                    }

                    @Override
                    public LocalDateTime parseValue(Object input) throws CoercingParseValueException {
                        try {
                            if (input instanceof String) {
                                return LocalDateTime.parse((String) input, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                            }
                            throw new CoercingParseValueException("Expected a String");
                        } catch (DateTimeParseException e) {
                            throw new CoercingParseValueException(String.format("Not a valid datetime: '%s'.", input), e);
                        }
                    }

                    @Override
                    public LocalDateTime parseLiteral(Object input) throws CoercingParseLiteralException {
                        if (input instanceof StringValue) {
                            try {
                                return LocalDateTime.parse(((StringValue) input).getValue(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                            } catch (DateTimeParseException e) {
                                throw new CoercingParseLiteralException(e);
                            }
                        }
                        throw new CoercingParseLiteralException("Expected a StringValue.");
                    }
                }).build();
    }

    @Bean
    public DataFetcherExceptionResolverAdapter exceptionResolver() {
        return new DataFetcherExceptionResolverAdapter() {
            @Override
            protected GraphQLError resolveToSingleError(Throwable ex, DataFetchingEnvironment env) {
                ErrorType errorType = ErrorType.INTERNAL_ERROR;
                String message = ex.getMessage();

                // Handle custom exceptions
                if (ex instanceof BadRequestException || ex instanceof IllegalArgumentException) {
                    errorType = ErrorType.BAD_REQUEST;
                } else if (ex instanceof ResourceNotFoundException) {
                    errorType = ErrorType.NOT_FOUND;
                } else if (ex instanceof AuthenticationException || ex instanceof AccessDeniedException) {
                    errorType = ErrorType.UNAUTHORIZED;
                } else if (ex instanceof RateLimitExceededException) {
                    errorType = ErrorType.BAD_REQUEST;
                    message = message != null ? message : "Rate limit exceeded";
                } else if (ex instanceof ResourceLockedException) {
                    errorType = ErrorType.INTERNAL_ERROR;
                    message = message != null ? message : "Resource is locked";
                } else if (ex instanceof EmailSendException) {
                    errorType = ErrorType.INTERNAL_ERROR;
                    message = message != null ? message : "Email sending failed";
                } else if (ex instanceof BadCredentialsException) {
                    errorType = ErrorType.UNAUTHORIZED;
                    message = "Invalid username or password";
                } else if (ex instanceof UsernameNotFoundException) {
                    errorType = ErrorType.UNAUTHORIZED;
                    message = "User not found";
                } else if (ex instanceof MethodArgumentNotValidException) {
                    errorType = ErrorType.BAD_REQUEST;
                    message = "Validation failed";
                } else if (ex instanceof BindException) {
                    errorType = ErrorType.BAD_REQUEST;
                    message = "Request binding failed";
                } else if (ex instanceof HttpRequestMethodNotSupportedException) {
                    errorType = ErrorType.BAD_REQUEST;
                    message = "HTTP method not supported";
                } else if (ex instanceof DataIntegrityViolationException) {
                    errorType = ErrorType.BAD_REQUEST;
                    message = "Data integrity violation";
                } else if (ex instanceof jakarta.persistence.EntityNotFoundException) {
                    errorType = ErrorType.NOT_FOUND;
                    message = "Entity not found";
                } else if (ex instanceof java.util.NoSuchElementException) {
                    errorType = ErrorType.NOT_FOUND;
                    message = "Element not found";
                }

                return GraphQLError.newError()
                        .errorType(errorType)
                        .message(message != null ? message : "An error occurred")
                        .path(env.getExecutionStepInfo().getPath())
                        .location(env.getField().getSourceLocation())
                        .build();
            }
        };
    }
}