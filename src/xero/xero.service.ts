import { Inject, Injectable} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateXeroDto } from './dto/CreateXeroDto';
import { Xero } from './xero.model';

@Injectable()
export class XeroService {
	constructor(@InjectModel(Xero) private readonly xeroRepository: typeof Xero) { 
	}

	async create(dto: CreateXeroDto){
		return await this.xeroRepository.create(dto);
	}

	// async getAcc(xero){
	// 	return await xero.accountingApi.getAccounts('');
	// }
}

