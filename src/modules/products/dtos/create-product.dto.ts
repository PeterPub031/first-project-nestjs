export class CreateProductDto {
  name: string;
  description?: string;
  price: number;
  details: string;
  color?: string;
  imageURL: string;
  quantity: number;
  categoryId: string;
}
