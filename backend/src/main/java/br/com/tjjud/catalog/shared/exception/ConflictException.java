package br.com.tjjud.catalog.shared.exception;

public class ConflictException extends RuntimeException {

    private final String messageKey;
    private final Object[] messageArguments;

    public ConflictException(String messageKey, Object... messageArguments) {
        super(messageKey);
        this.messageKey = messageKey;
        this.messageArguments = messageArguments.clone();
    }

    public String getMessageKey() {
        return messageKey;
    }

    public Object[] getMessageArguments() {
        return messageArguments.clone();
    }
}
