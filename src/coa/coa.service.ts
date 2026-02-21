import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from 'src/account/account.model';
import { AccountingMethodMapping } from 'src/account/accountingMethodMapping.model';
import { Classes } from 'src/classes/classes.model';
import { Group } from 'src/group/group.model';
import { CreateCoaDto } from './dto/create-coa.dto';
import { Clashflow } from 'src/clashflow/clashflow.model';
import { Types } from 'src/types/types.model';
import { AccountType } from 'src/account/accountType.model';
import { SaleTax } from 'src/sale-tax/sale-tax.model';
import { WithHoldingTax } from 'src/with-holding-tax/with-holding-tax.model';
import { Op } from 'sequelize';

const DEFAULT_COMPANY_ID = 0;

export interface TaxData{
  id: number;
  codeTax: string;
  nameTax: string;
}

@Injectable()
export class CoaService {

    constructor(
        @InjectModel(Classes) private classesRepository: typeof Classes,
        @InjectModel(Group) private groupRepository: typeof Group,
        @InjectModel(Account) private accountRepository: typeof Account,
        @InjectModel(AccountingMethodMapping) private accountingMethodMappingRepository: typeof AccountingMethodMapping,
        @InjectModel(Clashflow) private clashflowRepository: typeof Clashflow,
        @InjectModel(Types) private typeRepository: typeof Types,
        @InjectModel(AccountType) private accountTypeRepository: typeof AccountType,
        @InjectModel(SaleTax) private readonly saleTaxRepository: typeof SaleTax,
        @InjectModel(WithHoldingTax) private readonly withHoldingTaxRepository: typeof WithHoldingTax
    ) { }

    public async companyHasCoA(companyId: number): Promise<boolean> {
        const companyAccts = await this.accountRepository.findOne({
            where: { companyId },
        });

        return companyAccts !== null;
    }


    public async createDefaultCOA(dto: CreateCoaDto) {
        // Step 1: Insert classes
        const newCompanyClasses = await this.insertClasses(dto.companyId);

        // Step 2: Insert groups
        const newCompanyGroups = await this.insertGroups(dto.companyId, newCompanyClasses);

        // Step 3: Insert Accounts
        await this.insertAccounts(dto, newCompanyGroups);
            
        return true;
    }
    
    private async insertClasses(newCompanyId: number): Promise<Classes[]> {
            
        // Получение классов по умолчанию
        const defaultClasses = await this.classesRepository.findAll({
            where: { companyId: DEFAULT_COMPANY_ID },
            raw: true
        });

        let newCompanyClasses = [];

        //console.log(newCompanyId);
        // Создание новых записей для новой компании
        for (const defaultClass of defaultClasses) {
            const newClass = {
                ...defaultClass, // Копируем данные из класса по умолчанию
                companyId: newCompanyId,
                defaultId: defaultClass.id, // Используем ID для маппинга
                filePath: ''
            };
            delete (newClass.id);
            //console.log(newClass);
            newCompanyClasses.push(newClass);
        }

            // Вставка новых классов
        newCompanyClasses = await this.classesRepository.bulkCreate(newCompanyClasses);

        // Обновление поля filePath для каждого нового класса
        for (const newClass of newCompanyClasses) {
            newClass.filePath = `[${newClass.typeId},${newClass.id}]`;
            await newClass.update(
                { filePath: newClass.filePath }
            );
        }

        return newCompanyClasses;
    }


    private async insertGroups(newCompanyId: number, companyClasses: Classes[]): Promise<Group[]> {

        // Получение групп по умолчанию
        const defaultGroups = await this.groupRepository.findAll({
            where: { companyId: DEFAULT_COMPANY_ID },
            raw: true
        });

        let newCompanyGroups = [];

        // Создание новых записей для новой компании
        for (const defaultGroup of defaultGroups) {
            const associatedClass = companyClasses.find(cls => cls.defaultId === defaultGroup.classId);
            if (!associatedClass) {
                throw new Error(`No matching class found for DefaultClassId: ${defaultGroup.classId}`);
            }

            const newGroup = {
                ...defaultGroup, // Копируем данные из группы по умолчанию
                companyId: newCompanyId,
                defaultId: defaultGroup.id, // Сохраняем DefaultId для маппинга
                classId: associatedClass.id, // Связываем с новым классом
                filePath: associatedClass.filePath, // Изначальный FilePath на основе класса
            };
            delete (newGroup.id);
            newCompanyGroups.push(newGroup);
        }

        // Массовая вставка новых групп
        newCompanyGroups = await this.groupRepository.bulkCreate(newCompanyGroups);

        // Обновление поля FilePath для каждой группы
        for (const newGroup of newCompanyGroups) {
            newGroup.filePath = `${newGroup.filePath.slice(0, -1)},${newGroup.id}]`;
            await newGroup.update(
                { filePath: newGroup.filePath }
            );
        }

        return newCompanyGroups;
    }


    private async insertAccounts( dto: CreateCoaDto, companyGroups: Group[]): Promise<void> {

        // Получение счетов по умолчанию
        const defaultAccounts = await this.accountRepository.findAll({
            where: { companyId: DEFAULT_COMPANY_ID },
            raw: true
        });
        //console.log(defaultAccounts);
        // Получение активных методов учета
        const methodAccounting = await this.accountingMethodMappingRepository.findAll({
            where: {
                businessTypeId: dto.businessTypeId,
                businessFormationId: dto.businessFormationId,
                methodOfAccountingId: dto.methodOfAccountingId,
            },
            raw: true
        });

        //console.log(methodAccounting);

        const activeMethodAccounting = methodAccounting
            .filter((m) => m.showHide)
            .map((m) => m.dBCode);

        //console.log(activeMethodAccounting);
        const filteredAccounts = defaultAccounts.filter((account) =>
            activeMethodAccounting.includes(account.code),
        );
        //console.log(filteredAccounts);
        let newCompanyAccounts = [];

        for (const filteredAccount of filteredAccounts) {
            const associatedGroup = companyGroups.find(
                (group) => group.defaultId === filteredAccount.groupId,
            );
            if (!associatedGroup) {
                throw new Error(`No matching group found for DefaultGroupId: ${filteredAccount.groupId}`);
            }

            const newAccount = {
                ...filteredAccount,
                companyId: dto.companyId,
                defaultId: filteredAccount.id,
                groupId: associatedGroup.id,
                filePath: associatedGroup.filePath,
                accountCurrencyId: dto.currencyId,
            };
            delete (newAccount.id);

            newCompanyAccounts.push(newAccount);
            // console.log(newAccount);
            // await this.accountRepository.create(newAccount);
        }
        //console.log(newCompanyAccounts);
        // Массовая вставка новых счетов
        newCompanyAccounts = await this.accountRepository.bulkCreate(newCompanyAccounts);

        // Шаг 1: Обработка элементов для создания FilePath
        for (const account of newCompanyAccounts) {
            if (!account.parentId) {
                account.filePath = `${account.filePath.slice(0, -1)},${account.id}]`;
            } else {
                const parentAccount = newCompanyAccounts.find(
                    (acc) => acc.defaultId === account.parentId,
                );
                if (parentAccount) {
                    account.parentId = parentAccount.id;
                    account.filePath = `${parentAccount.filePath.slice(0, -1)},${account.id}]`;
                }
            }

            await account.update({ filePath: account.filePath, parentId: account.parentId });
        }

        // Шаг 2: Сортировка массива по FilePath
        // const sortedAccounts = newCompanyAccounts.sort((a, b) =>
        //     a.filePath.localeCompare(b.filePath),
        // );

        // Шаг 3: Обновление отсортированных элементов в базе данных
        // for (const account of sortedAccounts) {
        //     await account.update(
        //         { filePath: account.filePath, parentId: account.parentId }
        //     );
        // }
    }
    
    async getFlattenCoATree( companyId: number, coaSwitchRequestModel: any, showInactive = false): Promise<Object> {
        const coaTreeViewModel = {
            tree: [],
            clashflowArr: []
        };

        // Get records of related tables
        let cashFlows = await this.clashflowRepository.findAll({raw: true});
        let types = (await this.typeRepository.findAll({ raw: true }));;
        let classes = await this.classesRepository.findAll({ where: { companyId }, raw: true });
        let groups = await this.groupRepository.findAll({ where: { companyId }, raw: true });
        let accounts = await this.accountRepository.findAll({ where: { companyId, show: true }, raw: true });
        let accountTypes = await this.accountTypeRepository.findAll({raw: true});
        let salesTax = await this.saleTaxRepository.findAll({ raw: true });
        let withHoldingTax = await this.withHoldingTaxRepository.findAll({raw: true});

        //Filter out groups or classes that don't have children
        const groupIds = accounts.map((account) => account.groupId);
        groups = groups.filter((group) => groupIds.includes(group.id) || group.defaultId === null);

        const classIds = groups.map((group) => group.classId);
        classes = classes.filter((classItem) => classIds.includes(classItem.id));

        if (!showInactive) {
            accounts = accounts.filter((account) => account.active === true);
        }

        // Add Types
        types.forEach((item) => {
            item.filePath = JSON.parse(item.filePath);
            coaTreeViewModel.tree.push(item);
        });
        //coaTreeViewModel.tree.push(types);

        // Add Classes and assign ClashflowObj
        classes.forEach((item) => {
            item.clashflowObj = cashFlows.find((cf) => cf.id === item.clashflowId);
            item.filePath = JSON.parse(item.filePath);
            coaTreeViewModel.tree.push(item);
        });
        //coaTreeViewModel.tree.push(classes);

        // Add Groups and assign ClashflowObj
        groups.forEach((item) => {
            item.clashflowObj = cashFlows.find((cf) => cf.id === item.clashflowId);
            item.filePath = JSON.parse(item.filePath);
            coaTreeViewModel.tree.push(item);
        });
        //coaTreeViewModel.tree.push(groups);

        // Add Accounts and assign related data
        accounts.forEach((item) => {

            const accountTax = this.getAccountTax(
                item.assignToTaxAccountId,
                accounts,
                salesTax,
                withHoldingTax,
            );

            const filePath = JSON.parse(item.filePath);

            const finDocName = types.find((t) => t.id === filePath[0])?.finDocName;

            item.accountTypeName = accountTypes.find(
                (at) => at.id === item.accountTypeId,
            )?.accountTypeName;
            item.clashflowObj = cashFlows.find(
                (cf) => cf.id === item.clashflowId,
            );
            //(item as any).report = report[0][0].finDocName === 'BALANCE_SHEET' ? 'BS' : 'IS';
            item.nameTax = accountTax?.nameTax;
            item.codeTax = accountTax?.codeTax;
            item.filePath = filePath;
            (item as any).report = finDocName === 'BALANCE SHEET' ? 'BS' : 'IS';
            coaTreeViewModel.tree.push(item);
        });

        coaTreeViewModel.tree.sort((a, b) => {
            const aParts = a.code.split('.').map(Number);
            const bParts = b.code.split('.').map(Number);

            for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                const aPart = aParts[i] || 0; // Если часть отсутствует, считать её равной 0
                const bPart = bParts[i] || 0;

                if (aPart !== bPart) {
                    return aPart - bPart;
                }
            }
            return 0;
        });

        //coaTreeViewModel.tree.push(accounts);
        coaTreeViewModel.clashflowArr = cashFlows;
        return coaTreeViewModel;
    } 
  
    getAccountTax( assignToTaxAccountId: number | null, accounts: Account[], saleTaxes: SaleTax[], withHoldingTaxes: WithHoldingTax[]): TaxData | null {
        if (assignToTaxAccountId === null || assignToTaxAccountId === 0) {
            return null;
        }

        const assignedAccount = accounts.find((account) => account.id === assignToTaxAccountId);
        if (assignedAccount) {
            if (assignedAccount.taxTypeId === 1) {
                // Если налог на продажи
                const saleTax = saleTaxes.find((tax) => tax.id === assignedAccount.taxId);
                if (saleTax) {
                    return {
                        id: saleTax.id,
                        codeTax: saleTax.code,
                        nameTax: saleTax.name,
                    };
                }
            } else {
                // Если налог на удержание
                const withHoldingTax = withHoldingTaxes.find((tax) => tax.id === assignedAccount.taxId);
                if (withHoldingTax) {
                    return {
                        id: withHoldingTax.id,
                        codeTax: withHoldingTax.code,
                        nameTax: withHoldingTax.name,
                    };
                }
            }
        }

        return null;
    }

    async switchCoA(companyId, dto: CreateCoaDto): Promise<boolean> {
        companyId = Number(companyId)
        const accountingMethodMappings = await this.accountingMethodMappingRepository.findAll({
            where: {
                businessFormationId: dto.businessFormationId,
                businessTypeId: dto.businessTypeId,
                methodOfAccountingId: dto.methodOfAccountingId,
                showHide: true,
            },
            raw: true
        });

        if (!accountingMethodMappings.length) return false;

        await this.accountRepository.update({ active: false }, {
            where: {
                code: {
                    [Op.notIn]: accountingMethodMappings.map(mapping => mapping.dBCode) 
                },
                companyId
            }
        });

        const existAccounts = await this.accountRepository.findAll({
            where: {
                companyId,
                active: true
            },
            attributes: ['code'],
            raw: true,
        });

        const codeArr = accountingMethodMappings.filter((mapping) =>
            !existAccounts.some((account) => mapping.dBCode === account.code)
        );

        const defaultAccountsToAdd = await this.accountRepository.findAll({
            where: {
                companyId: DEFAULT_COMPANY_ID,
                code: codeArr.map(mapping => mapping.dBCode) 
            },
            raw: true,
        });

        const filteredGroups = await this.groupRepository.findAll({
            where: {
                companyId,
                //defaultId: defaultAccountsToAdd.map((defaultAccount) => defaultAccount.groupId),
            },
            raw: true
        });

        let newCompanyAccounts = [];

        //console.log(filteredGroups);

        for (const filteredAccount of defaultAccountsToAdd) {
            const associatedGroup = filteredGroups.find(
                (group) => group.defaultId === filteredAccount.groupId,
            );
            if (!associatedGroup) {
                throw new Error(`No matching group found for DefaultGroupId: ${filteredAccount.groupId}`);
            }

            const newAccount = {
                ...filteredAccount,
                companyId,
                defaultId: filteredAccount.id,
                groupId: associatedGroup.id,
                filePath: associatedGroup.filePath,
                accountCurrencyId: dto.currencyId,
            };
            delete (newAccount.id);

            newCompanyAccounts.push(newAccount);
            // console.log(newAccount);
            // await this.accountRepository.create(newAccount);
        }
        //console.log(newCompanyAccounts);
        // Массовая вставка новых счетов
        newCompanyAccounts = await this.accountRepository.bulkCreate(newCompanyAccounts);
        let allAccounts = await this.accountRepository.findAll({ where: { companyId, active: true } });
        // Шаг 1: Обработка элементов для создания FilePath
        for (let account of newCompanyAccounts) {
            if (!account.parentId) {
                account.filePath = `${account.filePath.slice(0, -1)},${account.id}]`;
            } else {
                console.log(account.code);
                //console.log(newCompanyAccounts);
                const parentAccount = allAccounts.find(
                    (acc) => acc.defaultId === account.parentId
                );
                console.log(parentAccount);
                if (parentAccount) {
                    account.parentId = parentAccount.id;
                    account.filePath = `${parentAccount.filePath.slice(0, -1)},${account.id}]`;
                }
            }

            await account.update({ filePath: account.filePath, parentId: account.parentId });
        }
        return true;
    }
}
