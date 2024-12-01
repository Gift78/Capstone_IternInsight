export type CreatePostParams = {
  title: string;
  description: string;
  position: string[];
  startDate?: Date;
  endDate: Date;
  email: string;
  tel: string;
  adminId: number;
  companyId: number;
};

export type UpdatePostParams = {
  title?: string;
  description?: string;
  position?: string[];
  startDate?: Date;
  email?: string;
  tel?: string;
  endDate?: Date;
  companyId?: number;
};

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
