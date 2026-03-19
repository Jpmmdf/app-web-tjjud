package br.com.tjjud.catalog.shared.api;

import br.com.tjjud.catalog.shared.i18n.ApplicationMessages;
import br.com.tjjud.catalog.shared.exception.BusinessValidationException;
import br.com.tjjud.catalog.shared.exception.ConflictException;
import br.com.tjjud.catalog.shared.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    private final ApplicationMessages messages;

    public ApiExceptionHandler(ApplicationMessages messages) {
        this.messages = messages;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<ValidationError> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(this::toValidationError)
                .toList();
        return respond(
                HttpStatus.UNPROCESSABLE_ENTITY,
                messages.get("problem.validacao.titulo"),
                messages.get("problem.validacao.detalhe"),
                request,
                errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ProblemResponse> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        List<ValidationError> errors = ex.getConstraintViolations().stream()
                .map(violation -> new ValidationError(
                        violation.getPropertyPath().toString(),
                        "ConstraintViolation",
                        violation.getMessage()))
                .toList();
        return respond(
                HttpStatus.UNPROCESSABLE_ENTITY,
                messages.get("problem.validacao.titulo"),
                messages.get("problem.restricao.detalhe"),
                request,
                errors);
    }

    @ExceptionHandler(BusinessValidationException.class)
    public ResponseEntity<ProblemResponse> handleBusinessValidation(
            BusinessValidationException ex, HttpServletRequest request) {
        String detail = messages.get(ex.getMessageKey(), ex.getMessageArguments());
        return respond(
                HttpStatus.UNPROCESSABLE_ENTITY,
                messages.get("problem.validacao-negocio.titulo"),
                detail,
                request,
                List.of(new ValidationError("request", ex.getCode(), detail)));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        String resourceName = messages.get(ex.getResourceKey());
        String detail = messages.get("error.recurso.nao-encontrado", resourceName, ex.getResourceId());
        return respond(HttpStatus.NOT_FOUND, messages.get("problem.recurso-nao-encontrado.titulo"), detail, request, List.of());
    }

    @ExceptionHandler({ConflictException.class, DataIntegrityViolationException.class})
    public ResponseEntity<ProblemResponse> handleConflict(Exception ex, HttpServletRequest request) {
        String detail = messages.get("problem.conflito.detalhe");
        if (ex instanceof ConflictException conflictException) {
            detail = messages.get(conflictException.getMessageKey(), conflictException.getMessageArguments());
        } else if (ex instanceof DataIntegrityViolationException dataIntegrityViolationException) {
            detail = resolveDataIntegrityDetail(dataIntegrityViolationException);
        }
        return respond(HttpStatus.CONFLICT, messages.get("problem.conflito.titulo"), detail, request, List.of());
    }

    private String resolveDataIntegrityDetail(DataIntegrityViolationException ex) {
        String details = (ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage());
        if (details == null) {
            return messages.get("problem.conflito.detalhe");
        }
        if (details.contains("ux_autor_nome_ci")) {
            return messages.get("error.autor.duplicado.generico");
        }
        if (details.contains("ux_assunto_descricao_ci")) {
            return messages.get("error.assunto.duplicado.generico");
        }
        if (details.contains("ux_livro_identidade_ci")) {
            return messages.get("error.livro.duplicado");
        }
        if (details.contains("fk_livro_autor_autor")) {
            return messages.get("error.autor.exclusao.vinculado");
        }
        if (details.contains("fk_livro_assunto_assunto")) {
            return messages.get("error.assunto.exclusao.vinculado");
        }
        return messages.get("problem.conflito.detalhe");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
        return respond(
                HttpStatus.INTERNAL_SERVER_ERROR,
                messages.get("problem.erro-inesperado.titulo"),
                messages.get("problem.erro-inesperado.detalhe"),
                request,
                List.of());
    }

    private ValidationError toValidationError(FieldError error) {
        return new ValidationError(error.getField(), error.getCode(), error.getDefaultMessage());
    }

    private ResponseEntity<ProblemResponse> respond(
            HttpStatus status,
            String title,
            String detail,
            HttpServletRequest request,
            List<ValidationError> errors) {
        ProblemResponse response = new ProblemResponse(
                "about:blank",
                title,
                status.value(),
                detail,
                request.getRequestURI(),
                errors);
        return ResponseEntity.status(status).body(response);
    }
}
