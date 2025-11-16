import { Module } from '@nestjs/common';
import { ItemsBarcodeSymbologiesService } from './items-barcode-symbologies.service';
import { ItemsBarcodeSymbologiesController } from './items-barcode-symbologies.controller';

@Module({
  providers: [ItemsBarcodeSymbologiesService],
  controllers: [ItemsBarcodeSymbologiesController]
})
export class ItemsBarcodeSymbologiesModule {}
