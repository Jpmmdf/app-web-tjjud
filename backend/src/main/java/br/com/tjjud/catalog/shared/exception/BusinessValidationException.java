package br.com.tjjud.catalog.shared.exception;

public class BusinessValidationException extends RuntimeException {

    private final String code;
    private final String messageKey;
    private final Object[] messageArguments;

    public BusinessValidationException(String code, String messageKey, Object... messageArguments) {
        super(messageKey);
        this.code = code;
        this.messageKey = messageKey;
        this.messageArguments = messageArguments.clone();
    }

    public String getCode() {
        return code;
    }

    public String getMessageKey() {
        return messageKey;
    }

    public Object[] getMessageArguments() {
        return messageArguments.clone();
    }
}
