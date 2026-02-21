import { applyDecorators, createParamDecorator, ExecutionContext, UseGuards } from '@nestjs/common';
import { SetMetadata } from "@nestjs/common";
import { XeroClient } from 'xero-node';
import { Xero } from './xero.model';
import { TokenSet } from 'openid-client';

let map = new Map();

export const XeroDec = createParamDecorator(
	async (data: string, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		//const { companyId } = request.body;
		//console.log(request);
		const { companyId } = request.params;
		const createXero = async () => {
			const client = await Xero.findOne({ where: { companyId } });
			const xeroClient = new XeroClient({
				clientId: client.clientIdKey,
				clientSecret: client.clientSecretKey,
				grantType: 'client_credentials'
			});
			await xeroClient.getClientCredentialsToken();
			map.delete(companyId)
			map.set(companyId, xeroClient);
		}
		if (!map.has(companyId))
			await createXero();
		else{
			const xero = map.get(companyId);
			const tokenSet: TokenSet = await xero.readTokenSet();
			if (tokenSet.expired())
				await createXero();
		}
		
		return map.get(companyId);
	},
);