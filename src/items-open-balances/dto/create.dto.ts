import { ApiProperty } from "@nestjs/swagger";

class ItemsOBDValue {

  readonly qty: number;

  readonly costPrice: number;

  readonly itemId: number;

  readonly accountId: number;

  readonly vendorId: number;

  readonly description: string;
}

export class CreateItemsOBDto {

  readonly itemsOBDList: ItemsOBDValue[];

  readonly warehouseId: number;

  readonly referenceNo: string;

  readonly description: string;

  readonly date: Date;

  readonly companyId: number;

  readonly createdBy: number;

  readonly currency: string;

  readonly fxRate: number;

  readonly totalAmount: number;
  
}