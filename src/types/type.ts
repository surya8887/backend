export interface NewUserRequestBody {
    _id: string;
    name: string;
    email: string;
    password: string;
    photo: string;
    dob: Date;
    gender: string;

}


export interface NewProductType {
    name: string;
    price: number;
    description?: string;
    category: string;
    stock: number;
}



// Define types for query parameters
export interface SearchRequestQuery {
    search?: string;
    sort?: string;
    category?: string;
    price?: string;
    page?: string;
}

export interface BaseQuery {
    name?: { $regex: string; $options: string };
    category?: string;
    price?: number;
}
