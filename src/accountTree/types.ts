// types.ts

export interface IClashflow {
  id: number;
  name: string;
}

// Универсальный интерфейс для налогов (подходит и для SaleTax, и для WithHoldingTax)
// В вашей логике использовалось поле value, которого нет в самих моделях (вероятно, оно приджойнено из TaxRate)
export interface ITax {
  id: number;
  code: string;
  name: string;
  value?: number; // Опционально, так как в моделях его нет, но вы используете findTax.value
}

// Описываем структуру аккаунта, который возвращает ваш RAW SQL запрос + наши динамические поля
export interface IAccount {
  id: number;
  companyId: number;
  code: string;
  name: string;
  groupId: number;
  DRCRCode: 'DR' | 'CR';
  currencyId: number;
  accountCurrencyId: number;
  taxId: number;
  taxTypeId: number;
  indelible: boolean;
  active: boolean;
  createdBy: string;
  updatedBy: string;
  createdDate: Date | string;
  updatedDate: Date | string;
  number: string;
  filePath: string | object | null; // Строка из БД, которая превращается в объект после JSON.parse
  entityType: string;
  assignToTaxAccountId: number;
  clashflowId: number;
  isBankAccount: boolean;
  isCreditCardAccount: boolean;
  accountTypeId: number;
  
  // Поля, которые генерируются внутри сырого SQL-запроса (CTE)
  amount: number;
  debit: number;
  credit: number;
  accountTypeName: string;
  parentId: number | null;
  description: string | null;
  remarks: string | null;

  // Динамические поля, которые мы добавляем прямо в цикле getAccountTree
  clashflowObj?: IClashflow | null;
  report?: 'BS' | 'IS';
  nameTax?: string;
  codeTax?: string;
  valueTax?: number | null;
}

// Интерфейс для финального ответа функции
export interface IAccountTreeResponse {
  accountTree: IAccount[];
  clashflowArr: IClashflow[];
}