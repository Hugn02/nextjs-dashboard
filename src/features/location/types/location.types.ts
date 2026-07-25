export interface Province {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  provinceCode: string;
}

export interface Ward {
  code: string;
  name: string;
  districtCode: string;
  provinceCode: string;
}

export interface UserLocation {
  /** Backend (applyMongooseSerialization) xóa _id, trả về id dạng string */
  id: string;
  /** Giữ lại để backward-compat nếu có nơi dùng */
  _id?: string;
  label: string;
  receiverName: string;
  phone: string;
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  wardCode: string;
  wardName: string;
  address: string;
  note?: string;
  isDefault: boolean;
}

export interface CreateUserLocationDto {
  label: string;
  receiverName: string;
  phone: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  address: string;
  note?: string;
}

export type UpdateUserLocationDto = Partial<CreateUserLocationDto>;
