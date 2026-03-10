import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AccountService } from "../account/account.service";
import { ClassesService } from "../classes/classes.service";
import { GroupService } from "../group/group.service";
import { TypesService } from "../types/types.service";
import { ClashflowService } from "../clashflow/clashflow.service";
import { WithHoldingTaxService } from 'src/with-holding-tax/with-holding-tax.service';
import { SaleTaxService } from 'src/sale-tax/sale-tax.service';
import { IAccount, IClashflow, ITax, IAccountTreeResponse } from './types';

@Injectable()
export class AccountTreeService {

  constructor(
    private accountService: AccountService,
    private classesService: ClassesService,
    private groupService: GroupService,
    private typesService: TypesService,
    private clashflowService: ClashflowService,
    private withHoldingTaxService: WithHoldingTaxService,
    private saleTax: SaleTaxService
  ) {}

  async getDataForTree(companyId) {
    try {
      let accountTree = [];

      let types = await this.typesService.getAllTypes();
      let clashflow = await this.clashflowService.getAllClashflow();
      let classes = await this.classesService.getClassByCompanyId(companyId);
      let groups = await this.groupService.getAllGroupsByCompanyId(companyId);

      types.map(x => {
        x.filePath = JSON.parse(x.filePath);
        return accountTree.push(x)
      });

      if (classes.length > 0) {
        classes.map(x => {
          let clashflowObj = clashflow.find(c => c.id === x.clashflowId);
          x.clashflowObj = clashflowObj ? clashflowObj : null;
          x.filePath = JSON.parse(x.filePath);
          return accountTree.push(x)
        });
      }

      if (groups.length > 0) {
        groups.map(x => {
          let clashflowObj = clashflow.find(c => c.id === x.clashflowId);
          x.clashflowObj = clashflowObj ? clashflowObj : null;
          x.filePath = JSON.parse(x.filePath);
          return accountTree.push(x)
        });
      }

      return accountTree;

    } catch (e) {
      console.log(e);
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  async getAccountTree(companyId: number): Promise<IAccountTreeResponse> {
    try {
      const [
        account, 
        clashflow, 
        accountTree,
        saleTaxList, 
        withholdingTaxList
      ] = await Promise.all([
        this.accountService.getAccountsTreeByCompanyId(companyId) as Promise<IAccount[]>,
        this.clashflowService.getAllClashflow() as Promise<IClashflow[]>,
        this.getDataForTree(companyId) as Promise<IAccount[]>,
        this.saleTax.getAll() as Promise<ITax[]>,
        this.withHoldingTaxService.getAll() as Promise<ITax[]>
      ]);

      const clashflowMap = new Map<number, IClashflow>(clashflow.map(c => [c.id, c]));
      const saleTaxMap = new Map<number, ITax>(saleTaxList.map(t => [t.id, t]));
      const withholdingTaxMap = new Map<number, ITax>(withholdingTaxList.map(t => [t.id, t]));

      if (account && account.length > 0) {
        for (const x of account) {
          
          x.clashflowObj = clashflowMap.get(x.clashflowId) || null;

          if (x.filePath && typeof x.filePath === 'string') {
            try {
              x.filePath = JSON.parse(x.filePath);
            } catch {
              x.filePath = null;
            }
          }

          if (x.code) {
            x.report = Number(x.code.charAt(0)) < 4 ? 'BS' : 'IS';
          }

          let findTax: ITax | undefined;
          if (x.taxTypeId === 1) {
            findTax = saleTaxMap.get(x.taxId);
          } else if (x.taxTypeId === 2) {
            findTax = withholdingTaxMap.get(x.taxId);
          }

          if (findTax) {
            x.nameTax = ''; 
            x.codeTax = findTax.code;
            x.valueTax = findTax.value || null;
          } else {
            x.nameTax = 'No tax';
            x.codeTax = 'No tax';
            x.valueTax = null;
          }

          accountTree.push(x);
        }
      }

      return {
        accountTree,
        clashflowArr: clashflow
      };

    } catch (e) {
      console.log(e);
      // Оставляем ваш try...catch, как вы и просили
      throw new HttpException(`Error: ${e}`, 500); 
    }
  }

  async getAccountDoubleTree(params) {
    try {

      let treeObj;

      let balanceSheet = await this.accountService.getAccountsTreeBalanceSheetByCompanyId(params.companyId, params.startDate, params.endDate);
      let incomeStatement = await this.accountService.getAccountsTreeIncomeStatementByCompanyId(params.companyId, params.startDate, params.endDate);
      let clashflow = await this.clashflowService.getAllClashflow();

      let accountTree = balanceSheet[0].concat(incomeStatement[0]);
      //await this.getDataForTree(params.companyId);


      if (accountTree.length > 0) {
        accountTree.forEach(x => {
          let clashflowObj = clashflow.find(c => c.id === x.clashflowId);
          x.clashflowObj = clashflowObj ? clashflowObj : null;
          x.filePath = JSON.parse(x.filePath);
          x.isChildren = true;
          if (x.entityType === 'account') {
            x.isChildren = false;
            if (accountTree.find(el => el.parentId === x.id))
              x.isChildren = true;
          }
        });
      }

      treeObj = {
        accountTree,
        clashflowArr: clashflow
      }

      return treeObj;

    } catch (e) {
      console.log(e);
      throw new HttpException(`Error: ${e}`, 500);
    }
  }
}
