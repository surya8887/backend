class ApiResponse {
    public status: number;
    public data: any;
    public message: string;
    public success: boolean;

    constructor(status: number,data: any, message: string = 'success' ) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.success = status < 400;
    }
}


export default ApiResponse;