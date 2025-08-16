import e from "express";

export type CreatePostParams = {
  title: string;
  subtitle?: string;
  description: string;
  position: string[];
  startDate?: Date;
  endDate: Date;
  email: string;
  tel: string;
  adminId: number;
  companyId: number;
};

export interface UpdatePostParams {
  title?: string;
  subtitle?: string;
  description?: string;
  position?: string[];
  startDate?: Date;
  endDate?: Date;
  email?: string;
  tel?: string;
  companyId?: number; // เปลี่ยนจาก required เป็น optional
  adminId?: number;
}

export type CreateReviewParams = {
  userId: number;
  title: string;
  description: string;
  date: Date;
};

export type CreateBookMarkParams = {
  userId: number;
  postId: number;
};

export type UpdateReviewParams = {
  userId?: number;
  title?: string;
  description: string;
  date: Date; 
}

export type CreateQuestionParams = {
  userId: number;
  title: string;
  description: string;
  date: Date;
}

export type UpdateQuestionarams = {
  userId?: number;
  title?: string;
  description: string;
  date: Date; 
}

export type CreateUserParams = {
  adminId: number;
  userId?: number;
  name: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  position: string;
  description: string;
}

export type UpdateUserParams = {
  adminId: number;
  userId?: number;
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  phone?: string;
  position?: string;
  description?: string;
}
