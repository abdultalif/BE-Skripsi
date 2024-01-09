class ResponseError extends Error {

    constructor(statusResponse, status, errors, message, data) {
        super(message);
        this.statusResponse = statusResponse;
        this.status = status;
        this.errors = errors;
        this.data = data;
    }
}

export {
    ResponseError
}