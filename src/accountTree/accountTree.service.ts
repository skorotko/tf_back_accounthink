import { HttpException, Injectable } from "@nestjs/common";
import { AccountService } from "../account/account.service";
import { ClassesService } from "../classes/classes.service";
import { GroupService } from "../group/group.service";
import { TypesService } from "../types/types.service";
import { ClashflowService } from "../clashflow/clashflow.service";
import { WithHoldingTaxService } from 'src/with-holding-tax/with-holding-tax.service';
import { SaleTaxService } from 'src/sale-tax/sale-tax.service';

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

  async getAccountTree(companyId) {
    try {
      
      let treeObj;

      let account = await this.accountService.getAccountsTreeByCompanyId(companyId);
      let clashflow = await this.clashflowService.getAllClashflow();

      let accountTree = await this.getDataForTree(companyId);

      let saleTaxList = await this.saleTax.getAll();
      let withholdingTaxList = await this.withHoldingTaxService.getAll();


      if(account[0].length > 0){
        account[0].map(x => {
          let findTax;
          let clashflowObj = clashflow.find(c => c.id === x.clashflowId);
          x.clashflowObj = clashflowObj ? clashflowObj : null;
          x.filePath = JSON.parse(x.filePath);
          if (x.code) {
            if (Number(x.code.slice(0, 1)) < 4)
              x.report = 'BS';
            else
              x.report = 'IS';
          }
          if (x.taxTypeId === 1) {
            findTax = saleTaxList.find(findTax => findTax.id === x.taxId);
            x.nameTax = '';
            //x.nameTax = findTax ? findTax.name : 'No tax';
            x.codeTax = findTax ? findTax.code : 'No tax';
            x.valueTax = findTax ? findTax.value : null;
          } else if (x.taxTypeId === 2) {
            findTax = withholdingTaxList.find(findTax => findTax.id === x.taxId);
            x.nameTax = '';
            //x.nameTax = findTax ? findTax.name : 'No tax';
            x.codeTax = findTax ? findTax.code : 'No tax';
            x.valueTax = findTax ? findTax.value : null;
          } else {
            x.nameTax = 'No tax';
            x.codeTax = 'No tax';
          } 
          return accountTree.push(x)
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

  calculateBranchTotals(data) {
  const nodeMap = new Map(data.map(item => [item.id, item]));

  function calculateNodeTotal(nodeId) {
    const node: any = nodeMap.get(nodeId);
    if (!node) return 0;

    const children = data.filter(item => item.filePath[item.filePath.length - 2] === nodeId);

    if (children.length === 0) {
      // Leaf node
      node.amount = node.DRCRCode === 'DR' ? (node.debit || 0) : (node.credit || 0);
      return node.amount;
    }

    // Non-leaf node
    let creditTotal = 0;
    let debitTotal = 0;

    for (let child of children) {
      let childTotal = calculateNodeTotal(child.id);
      if (child.DRCRCode === 'DR') {
        debitTotal += childTotal;
      } else {
        creditTotal += childTotal;
      }
    }

    // Calculate the node's total based on its DRCRCode
    if (node.DRCRCode === 'DR') {
      node.amount = debitTotal - creditTotal;
    } else {
      node.amount = creditTotal - debitTotal;
    }

    return node.amount;
  }

  // Calculate totals for all top-level nodes
  const topLevelNodes = data.filter(item => item.filePath.length === 1);
  for (let node of topLevelNodes) {
    calculateNodeTotal(node.id);
  }

  return data;
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

      // if (incomeStatement[0].length > 0) {
      //   incomeStatement[0].map(x => {
      //     let clashflowObj = clashflow.find(c => c.id === x.clashflowId);
      //     x.clashflowObj = clashflowObj ? clashflowObj : null;
      //     x.filePath = JSON.parse(x.filePath);
      //     return accountTree.push(x)
      //   });
      // }

      // accountTree.forEach(x => {
      //   x.isChildren = true;
      //   if (x.entityType === 'account'){
      //     x.isChildren = false;
      //     if (accountTree.find(el => el.parentId === x.id))
      //       x.isChildren = true;
      //   }
      // })

      treeObj = {
        //accountTree: this.alculateBranchTotals(accountTree),
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
