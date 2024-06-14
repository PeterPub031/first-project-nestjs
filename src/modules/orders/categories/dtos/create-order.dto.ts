export class CreateOrderDto {
  paymentMethod: string;
  shippingAddress: string;
  shippingMethod: string;
  phone: string;
  status: string;
  total: number;
  note: string;
  orderDetails: CreateOrderDetailDto[];
  trackingOrders: CreateTrackingOdrderDto[];
}

export class CreateOrderDetailDto {
  productId: string;
  productName: string;
  productPrice: number;
  productQuantity: number;
}

export class CreateTrackingOdrderDto {
  userId: string;
  status: string;
}
