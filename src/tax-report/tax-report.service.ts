import { Injectable } from '@nestjs/common';
import { GetTaxReportDto } from "./dto/get-tax-report.dto";
import { DatabaseService } from "../database/database.service";
import { basename } from "path";

@Injectable()
export class TaxReportService {
  constructor(
    private readonly databaseService: DatabaseService
  ) {}

  private getModuleName() {
    return basename(__dirname);
  }

  // CLIENTS
  async getSaleTaxReportClients(params: GetTaxReportDto) {
    const moduleName = this.getModuleName();

    const [excel, header, details] = await Promise.all([
      this.databaseService.executeQuery(moduleName, "getTaxReportClientsExel.sql", params),
      this.databaseService.executeQuery(moduleName, "getTaxReportClientsDatHeaders.sql", params),
      this.databaseService.executeQuery(moduleName, "getTaxReportClientsDatDetails.sql", params)
    ]);

    const errorSource = [excel, header, details].find(source => source.isError);

    if (errorSource) {
      return {
        isError: true,
        data: null,
        error: errorSource.error
      }
    } else {
      return {
        isError: false,
        data: {
          excel: excel.data,
          dat: {
            header: header.data,
            details: details.data
          }
        },
        error: null
      }
    }
  }

  // CREDITABLE
  async getSaleTaxReportCreditable(params: GetTaxReportDto) {
    const moduleName = this.getModuleName();

    const [excel, header, details, control] = await Promise.all([
      this.databaseService.executeQuery(moduleName, "getTaxReportCreditableExel.sql", params),
      this.databaseService.executeQuery(moduleName, "getTaxReportCreditableDatHeaders.sql", params),
      this.databaseService.executeQuery(moduleName, "getTaxReportCreditableDatDetails.sql", params),
      this.databaseService.executeQuery(moduleName, "getTaxReportCreditableDatControl.sql", params)
    ]);

    const errorSource = [excel, header, details, control].find(source => source.isError);

    if (errorSource) {
      return {
        isError: true,
        data: null,
        error: errorSource.error
      }
    } else {
      return {
        isError: false,
        data: {
          excel: excel.data,
          dat: {
            header: header.data,
            details: details.data,
            control: control.data
          }
        },
        error: null
      }
    }
  }

  // VENDORS
  async getSaleTaxReportVendor(params: GetTaxReportDto) {
    const moduleName = this.getModuleName();

    const [excel, header, details] = await Promise.all([
      this.databaseService.executeQuery(moduleName, "getTaxReportVendorExel.sql", params),
      this.databaseService.executeQuery(moduleName, "getTaxReportVendorDatHeaders.sql", params),
      this.databaseService.executeQuery(moduleName, "getTaxReportVendorDatDetails.sql", params)
    ]);

    const errorSource = [excel, header, details].find(source => source.isError);

    if (errorSource) {
      return {
        isError: true,
        data: null,
        error: errorSource.error
      }
    } else {
      return {
        isError: false,
        data: {
          excel: excel.data,
          dat: {
            header: header.data,
            details: details.data
          }
        },
        error: null
      }
    }
  }

  async getWithholdingTaxReportVendor(params: GetTaxReportDto) {
    const moduleName = this.getModuleName();

    const [excel, header, details, control] = await Promise.all([
      this.databaseService.executeQuery(moduleName, "getWithholdingTaxReportVendorsExel.sql", params),
      this.databaseService.executeQuery(moduleName, "getWithholdingTaxReportVendorsDatHeader.sql", params),
      this.databaseService.executeQuery(moduleName, "getWithholdingTaxReportVendorsDatDetails.sql", params),
      this.databaseService.executeQuery(moduleName, "getWithholdingTaxReportVendorsDatControl.sql", params),
    ]);

    const errorSource = [excel, header, details, control].find(source => source.isError);

    if (errorSource) {
      return {
        isError: true,
        data: null,
        error: errorSource.error
      }
    } else {
      return {
        isError: false,
        data: {
          excel: excel.data,
          dat: {
            header: header.data,
            details: details.data,
            control: control.data
          }
        },
        error: null
      }
    }
  }
}
