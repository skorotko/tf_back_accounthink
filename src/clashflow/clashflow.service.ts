import { Injectable } from '@nestjs/common';
import { Clashflow } from "./clashflow.model";
import { InjectModel } from "@nestjs/sequelize";
@Injectable()
export class ClashflowService {
	constructor(@InjectModel(Clashflow) private clashflowRepository: typeof Clashflow) { }

	async getAllClashflow() {
		return await this.clashflowRepository.findAll({ raw: true})
	}
}
