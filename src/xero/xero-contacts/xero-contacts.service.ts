import { Injectable } from '@nestjs/common';
import { Address, Phone, Contact, Contacts, LineAmountTypes, CurrencyCode } from "xero-node";
import { CreateXeroContactsDto } from "./dto/create.dto";
import { PaymentTermType } from "xero-node/dist/gen/model/accounting/paymentTermType";

@Injectable()
export class XeroContactsService {

  async getDirectories(xero) {
    const promises = [];

    promises.push(xero.accountingApi.getCurrencies(''));
    promises.push(xero.accountingApi.getBrandingThemes(''));
    promises.push(xero.accountingApi.getAccounts(''));
    promises.push(xero.accountingApi.getTaxRates(''));
    promises.push(xero.accountingApi.getTrackingCategories(''));

    const [
      getCurrenciesResult,
      getBrandingThemesResult,
      getAccountsResult,
      getTaxRateResult,
      getTrackingCategoriesResult
    ] = await Promise.all(promises);

    return {
      contactStatusArr: Contact.ContactStatusEnum,
      salesDefaultLineAmountTypeArr: Contact.SalesDefaultLineAmountTypeEnum,
      purchasesDefaultLineAmountTypeArr: Contact.PurchasesDefaultLineAmountTypeEnum,
      addressesTypeArr: Address.AddressTypeEnum,
      phoneNumberTypes: Phone.PhoneTypeEnum,
      paymentTermTypeArr: PaymentTermType,
      currencies: getCurrenciesResult.response.body.Currencies,
      brandingThemes: getBrandingThemesResult.response.body.BrandingThemes,
      lineAmountTypes: LineAmountTypes,
      taxRateArr: getTaxRateResult.response.body.TaxRates,
      trackingCategories: getTrackingCategoriesResult.response.body.TrackingCategories,
      accounts: getAccountsResult.response.body.Accounts
    }
  }

  async get (xero, id) {
    let result = await xero.accountingApi.getContact('', id);
    return result.response.body.Contacts[0] || null
  }

  async getList(xero) {
    let result = await xero.accountingApi.getContacts('');
    return result.response.body.Contacts
  }

  async create(xero, data: CreateXeroContactsDto) {
    const newContacts: Contacts = new Contacts();
    newContacts.contacts = [data];

    let result: any;
    try {
      result = await xero.accountingApi.createContacts('', newContacts);
    } catch (error) {
      const element = error.response.body.Elements[0];
      return {
        status: error.response.statusCode,
        message: `${error.response.body.Type}, ${error.response.body.Message}, ${element.ValidationErrors.map(x => x.Message).join(', ')}`
      }
    }
    return {
      status: 200,
      result: result.response.body.Contacts[0]
    }
  }

  async update(xero, id, data: CreateXeroContactsDto) {
    const contacts: Contacts = { contacts: [data] };

    let result: any;
    try {
      result = await xero.accountingApi.updateContact('', id, contacts);
    } catch (error) {
      const updatedElement = error.response.body.Elements[0];
      const response = {
        status: error.response.statusCode,
        message: `${error.response.body.Type}, ${error.response.body.Message}, ${updatedElement.ValidationErrors.map(x => x.Message).join(', ')}`
      };
      // console.log(JSON.stringify(response));
      return response
    }
    return {
      status: 200,
      result: result.response.body.Contacts[0]
    }
  }
}
