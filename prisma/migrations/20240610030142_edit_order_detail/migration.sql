/*
  Warnings:

  - Changed the type of `product_price` on the `order_details` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "order_details" DROP COLUMN "product_price",
ADD COLUMN     "product_price" DOUBLE PRECISION NOT NULL;
