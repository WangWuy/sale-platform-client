import { BaseResponseModel } from "./base.response.model";

export class BaseModel {
    id!: number;
    createdAt?: string;
    updatedAt?: string;

    constructor(resModel: BaseResponseModel | null) {
        if (resModel) {
            this.id = resModel.id;
            this.createdAt = resModel.createdAt;
            this.updatedAt = resModel.updatedAt;
        }
    }
}