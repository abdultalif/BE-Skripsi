class ResponseError extends Error {

    constructor(statusResponse, status, message, data) {
        super(message);
        this.status = status;
        this.statusResponse = statusResponse;
        this.message = message;
        this.data = data;
    }
}

export {
    ResponseError
};