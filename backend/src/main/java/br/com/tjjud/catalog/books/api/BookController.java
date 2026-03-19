package br.com.tjjud.catalog.books.api;

import br.com.tjjud.catalog.books.application.BookService;
import br.com.tjjud.catalog.shared.api.PageResponse;
import br.com.tjjud.catalog.shared.api.SortDirection;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public PageResponse<BookResponse> list(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(defaultValue = "title") String sortField,
            @RequestParam(defaultValue = "ASC") SortDirection sortDirection) {
        return bookService.list(title, authorId, subjectId, page, size, sortField, sortDirection);
    }

    @GetMapping("/{bookId}")
    public BookResponse get(@PathVariable Long bookId) {
        return bookService.get(bookId);
    }

    @PostMapping
    public ResponseEntity<BookResponse> create(@Valid @RequestBody BookUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.create(request));
    }

    @PutMapping("/{bookId}")
    public BookResponse update(@PathVariable Long bookId, @Valid @RequestBody BookUpsertRequest request) {
        return bookService.update(bookId, request);
    }

    @DeleteMapping("/{bookId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long bookId) {
        bookService.delete(bookId);
    }
}
