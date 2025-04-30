export type ActionSuccess<T> = {
  success: true;
  message: string;
  data?: T;
};

export type ActionError = {
  success: false;
  message: string;
};

export type ActionResponse<T> = ActionSuccess<T> | ActionError;
