import { ApiProperty } from "@nestjs/swagger";

export class UpdateXeroCallbackDto {
  @ApiProperty({ example: 1, description: 'id_token'})
  readonly id_token: number;

  @ApiProperty({ example: 'access_token', description: 'access_token'})
  readonly access_token: string;

  @ApiProperty({ example: 'expires_at', description: 'expires_at'})
  readonly expires_at: number;

  @ApiProperty({ example: 'token_type', description: 'expires_at' })
  readonly token_type: string;

  @ApiProperty({ example: 'refresh_token', description: 'expires_at' })
  readonly refresh_token: string;

  @ApiProperty({ example: 'session_state', description: 'expires_at' })
  readonly session_state: string;
}