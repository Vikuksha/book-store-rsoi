import { MemberStatus, MemberType } from "../enums/member.enum";

// database dan qaytadgan document un interface
export interface Member {
  _id: string;
  memberType: MemberType;
  memberStatus: MemberStatus;
  memberNick: string;
  memberPhone: string;
  memberPassword?: string; // password yashrladi
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
  memberPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

// interface => input malumotlari uchun (yangi user yaratsh un)
export interface MemberInput {
  // member krtadgan malumotlar uchun
  memberType?: MemberType; // enum orqali hosil qlndi
  memberStatus?: MemberStatus; // ? bolshi ham mn, bolmasligi ham
  // mavjud bolmaganda default qiymatlari qabul qlnadi

  memberNick: string;
  memberPhone: string;
  memberPassword: string;
  // 3lasi bolishi shart bolgan => data set(postman dan kelyapti)

  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
  memberPoints?: number;
}

export interface LoginInput {
  memberNick: string;
  memberPassword: string;
}
// ikkalasi ham krtlshi majburiy

export interface MemberUpdateInput {
  memberNick?: string;
  memberPhone?: string;
  memberPassword?: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
}
