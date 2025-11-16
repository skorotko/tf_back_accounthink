import { Injectable } from "@nestjs/common";
import { AccountService } from "../account/account.service";
import { TaxTopLevelCategory, TaxType } from "../tax-type/tax-type.model";
import { WithHoldingTaxService } from "../with-holding-tax/with-holding-tax.service";
import { SaleTaxService } from "../sale-tax/sale-tax.service";
import { GetTaxAccountsDto } from "./dto/get-tax-accounts.dto";
import { CreateTaxAccountDto } from "./dto/create-tax-account.dto";
import { TaxRate } from "../tax-rate/tax-rate.model";
import { Account } from "../account/account.model";
import { ZeroTaxTypeService } from "../zero-tax-type/zero-tax-type.service";
import { logger } from 'sequelize/types/lib/utils/logger';

@Injectable()
export class TaxAccountService {
  constructor(
    private readonly withHoldingTaxService: WithHoldingTaxService,
    private readonly saleTaxService: SaleTaxService,
    private readonly accountService: AccountService,
    private readonly zeroTaxTypeService: ZeroTaxTypeService
  ) {}

  async getAllByCountryWithCheckCreatedForCompany (data: GetTaxAccountsDto) {
    let taxes = [];
    let typeCheck = data.taxTopType === TaxTopLevelCategory.sale;
    if (typeCheck) {
      taxes = await this.saleTaxService.getAllByCountryId(data.countryId);
    } else {
      taxes = await this.withHoldingTaxService.getAllByCountryId(data.countryId);
    }

    let accounts = await this.accountService.getAllCompanyAccountsByTaxId(
      data.companyId,
      taxes.map(tax => {
        return tax.id
      }),
      typeCheck ? 1 : 2
    );

    return taxes.map(tax => {
      tax.setDataValue(
        'created',
        accounts.some(acc => acc.taxId === tax.id)
      );
      tax.setDataValue(
        'taxAccount',
        accounts.some(acc => acc.taxId === tax.id) ? accounts.find(acc => acc.taxId === tax.id) : null
      );
      return tax
    })
  }

  async getAllSelectedInCompany (data: GetTaxAccountsDto) {
    let taxes = await this.getAllByCountryWithCheckCreatedForCompany({
      ...data
    });

    return taxes.filter(tax => tax.dataValues.created === true)
  }

  async create (data: CreateTaxAccountDto) {
    try {
      let tax = null;
      let noTax = false;
      let noTaxSP = false;
      let exemptTax = false;
      let zeroTax = false;
      const taxTypeId = data.taxTopType === TaxTopLevelCategory.sale ? 1 : 2;

      if (data.taxTopType === TaxTopLevelCategory.sale) {
        tax = await this.saleTaxService.getOne(data.taxId);
        const zeroTaxTypes = await this.zeroTaxTypeService.getAllByObjects();
        if (tax.taxTypeId !== zeroTaxTypes.byDefault.id) {
          noTax = tax.taxTypeId == zeroTaxTypes.noTax.id;
          noTaxSP = tax.taxTypeId == zeroTaxTypes.noTaxSP.id;
          exemptTax = tax.taxTypeId == zeroTaxTypes.taxExempt.id;
          zeroTax = tax.taxTypeId == zeroTaxTypes.zeroTax.id;
        }
      } else {
        tax = await this.withHoldingTaxService.getOne(data.taxId);
      }

      let taxAccount = await this.accountService.getCompanyAccountByTaxIdAndTaxTypeId(data.companyId, tax.id, taxTypeId);

      if (taxAccount) {
        return {
          error: true,
          data: null,
          message: `Failed to create tax-account: tax-account already exists`
        }
      }

      await this.createTaxAccount(data.companyId, data.currencyId, tax, noTax, noTaxSP, exemptTax, zeroTax);
    } catch (e) {
      console.error('Error creating tax accounts:', e);
    }
  }

  async createTaxAccount(companyId, currencyId, tax, noTax, noTaxSP, exemptTax, zeroTax, transaction = null) {
    const data = {
      companyId, currencyId, taxName: tax.name, noTax, noTaxSP, exemptTax, zeroTax
    };
    const parentAccount = await this.accountService.getAccountByCompanyIdAndAccountTypeId({
      companyId,
      accountTypeId: tax.type.accountTypeID
    });

    let maxAccountNumber = await this.accountService.getChildAccountsCount(parentAccount.id);

    let newAccountData = {
      code: `${parentAccount.code}.${maxAccountNumber + 1}`,
      name: tax.name,
      companyId,
      currencyId,
      accountCurrencyId: parentAccount.accountCurrencyId,
      DRCRCode: parentAccount.DRCRCode,
      groupId: parentAccount.groupId,
      parentId: parentAccount.id,
      active: true,
      clashflowId: parentAccount.clashflowId,
      accountTypeId: parentAccount.accountTypeId,
      createdDate: new Date(),
      entityType: 'account',
      taxId: tax.id,
      taxTypeId: tax.type.topType === TaxTopLevelCategory.sale ? 1 : 2,
      noTax,
      noTaxSP,
      exemptTax,
      zeroTax,
      bankId: null,
      CCId: null,
      isBankAccount: false,
      isCreditCardAccount: false,
      filePath: ''
    };

    let newAccount = await this.accountService.create(newAccountData, transaction);
    console.log(`newAccount: ${JSON.stringify({code: newAccount.code, name: newAccount.name})}`);

    if (transaction === null) {
      return await newAccount.update({
        filePath: `[${parentAccount.filePath.substr(1, parentAccount.filePath.length-2)},${newAccount.id}]`
      });
    } else {
      return await newAccount.update({
        filePath: `[${parentAccount.filePath.substr(1, parentAccount.filePath.length-2)},${newAccount.id}]`
      },{transaction});
    }
  }

  async getAllTaxAccountsForCompanyVendorClientDirectories(companyId: number) {
    let companyAccounts: any = await this.accountService.getCompanyAccountsByAccountTypeId({
      companyId: companyId,
      accountTypeId: [8, 11, 12, 13, 16]
    });

    companyAccounts = await this.addTaxesToTaxAccounts(companyAccounts);

    let inputTaxSubAccounts = companyAccounts.filter(x => x.accountTypeId === 8);
    let outputTaxSubAccounts = companyAccounts.filter(x => x.accountTypeId === 11);
    let creditableVatWithheldSubAccounts = companyAccounts.filter(x => x.accountTypeId === 16); //vendor/client
    let сreditableWithHoldingTaxSub = companyAccounts.filter(x => x.accountTypeId === 12); //client
    let withholdingTaxExpanded = companyAccounts.filter(x => x.accountTypeId === 13); //vendor

    return {
      inputTaxSubAccounts,
      outputTaxSubAccounts,
      creditableVatWithheldSubAccounts,
      сreditableWithHoldingTaxSub,
      withholdingTaxExpanded
    }
  }

  async addTaxesToTaxAccounts (taxAccounts: Array<Account>) {
    try {
      let saleTaxIdList = [];
      let withholdingTaxIdList = [];

      let saleTaxList = [];
      let withholdingTaxList = [];

      if (taxAccounts.length > 0) {
        for (let item of taxAccounts) {
          if (item.taxTypeId === 1) {
            saleTaxIdList.push(item.taxId)
          }
          if (item.taxTypeId === 2) {
            withholdingTaxIdList.push(item.taxId)
          }
        }
      }

      if (saleTaxIdList.length > 0) {
        saleTaxList = await this.saleTaxService.getAllByIdList(
          saleTaxIdList,
          [
            TaxType,
            TaxRate
          ]
        )
      }

      if (withholdingTaxIdList.length > 0) {
        withholdingTaxList = await this.withHoldingTaxService.getAllByIdList(
          withholdingTaxIdList,
          [
            TaxType,
            TaxRate
          ]
        )
      }

      return taxAccounts.map(item => {
        if (saleTaxList.length > 0 && item.taxTypeId === 1) {
          item.setDataValue(
            'tax',
            saleTaxList.some(tax => tax.id === item.taxId) ? saleTaxList.find(tax => tax.id === item.taxId) : null
          );
        } else if (withholdingTaxList.length > 0 && item.taxTypeId === 2) {
          item.setDataValue(
            'tax',
            withholdingTaxList.some(tax => tax.id === item.taxId) ? withholdingTaxList.find(tax => tax.id === item.taxId) : null
          )
        } else {
          item.setDataValue(
            'tax',
            null
          )
        }
        return item
      });
    } catch (e) {
      console.log(e)
    }
  }

  async findById (id: number | Array<number>) {
    let taxAccounts = await this.accountService.findById(id);
    return taxAccounts.length > 0 ? await this.addTaxesToTaxAccounts(taxAccounts) : []
  }

  async findByIdArrAndCompanyId(idArr, companyId) {
    let taxAccounts = await this.accountService.getAccountsByIdAndCompanyId(idArr, companyId);
    return taxAccounts.length > 0 ? await this.addTaxesToTaxAccounts(taxAccounts) : []
  }

  async createAllTaxAccountsForCompany(data: {countryId: number, companyId: number, currencyId: number}) {
    const saleTaxListPromise = this.saleTaxService.getAllByCountryId(data.countryId);
    const withholdingTaxListPromise = this.withHoldingTaxService.getAllByCountryId(data.countryId);

    const [
      saleTaxList,
      withholdingTaxList
    ] = await Promise.all([
      saleTaxListPromise,
      withholdingTaxListPromise
    ]);

    const dataForCreate = [];

    const zeroTaxTypes = await this.zeroTaxTypeService.getAllByObjects();

    let noTax = false;
    let noTaxSP = false;
    let exemptTax = false;
    let zeroTax = false;

    for (let tax of saleTaxList) {
      if (tax.taxTypeId !== zeroTaxTypes.byDefault.id) {
        noTax = tax.taxTypeId == zeroTaxTypes.noTax.id;
        noTaxSP = tax.taxTypeId == zeroTaxTypes.noTaxSP.id;
        exemptTax = tax.taxTypeId == zeroTaxTypes.taxExempt.id;
        zeroTax = tax.taxTypeId == zeroTaxTypes.zeroTax.id;
      }

      dataForCreate.push({tax, noTax, noTaxSP, exemptTax, zeroTax})
    }

    for (let tax of withholdingTaxList) {
      noTax = false;
      noTaxSP = false;
      exemptTax = false;
      zeroTax = false;

      dataForCreate.push({tax, noTax, noTaxSP, exemptTax, zeroTax})
    }

    const transaction = await Account.sequelize.transaction();

    const promises = [];

    try {
      for (let taxAccountData of dataForCreate) {
        promises.push(this.createTaxAccount(data.companyId, data.currencyId, taxAccountData.tax, taxAccountData.noTax, taxAccountData.noTaxSP, taxAccountData.exemptTax, taxAccountData.zeroTax, transaction))
      }

      await Promise.all(promises);

      await transaction.commit();

      return true
    } catch (e) {
      await transaction.rollback();
      console.error('Error creating tax accounts:', e);
      return false
    }
  }
}
