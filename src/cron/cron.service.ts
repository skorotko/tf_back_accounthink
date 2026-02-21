import { HttpException, Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Cron as CronModel } from "./cron.model";
import { CreateCronDto } from "./dto/CreateCronDto";
import { ExceptionHandler } from "@nestjs/core/errors/exception-handler";
import { Op } from "sequelize";
import { Cron } from '@nestjs/schedule';
import { TransactionService } from '../transaction/transaction.service';

export enum entityTypeId {
  trensactionRecord = 1
}

@Injectable()
export class CronService {

  constructor(@InjectModel(CronModel) private cronRepository: typeof CronModel,
    @Inject(forwardRef(() => TransactionService)) private readonly transactionService: TransactionService
    ) {
  }

  async create(data: CreateCronDto) {
    // console.log(data);
    await this.cronRepository.create({
      ...data
    });
  }

  @Cron('0 1 * * *')
  async implementationCron(): Promise<void> {
    const today = new Date(Date.now());
    let cronTaskArr = await this.cronRepository.findAll({
      where: {
        cronDate: today.toLocaleDateString()
      },
      raw: true
    });
    if (cronTaskArr.length > 0){
      let destroyTasksId = []
      cronTaskArr.forEach(async task => {
        switch (task.entityTypeId) {
          case entityTypeId.trensactionRecord:
            destroyTasksId.push(task.id)
            await this.transactionService.reverseTransaction(task.entityId);
            break;
          default:
            break;
        }
      });
      this.cronRepository.destroy({ where: { id: destroyTasksId }});
    }
  }
    
}
