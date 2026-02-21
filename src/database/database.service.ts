import { Injectable, NotFoundException } from '@nestjs/common';
import { Sequelize } from "sequelize-typescript";
import { join } from "path";
import { readFile } from "fs/promises";

/**
 * To use this service, create a folder named 'sql' within the module directory and place an SQL file containing the query you wish to execute there.
 * Note: It's important that file names within a single module do not repeat.
 */

@Injectable()
export class DatabaseService {
  constructor(private readonly sequelize: Sequelize) {}

  private async loadSqlQuery(moduleName: string, fileName: string): Promise<string> {
    const filePath = join(process.cwd(), 'src', moduleName, 'sql', fileName);

    try {
      return await readFile(filePath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new NotFoundException(`SQL file '${fileName}' not found in directory '${moduleName}/sql'`);
      }
      throw error;
    }
  }

  async executeQuery(moduleName: string, sqlFileName: string, params: Record<string, any>) {
    try {
      const sqlQuery = await this.loadSqlQuery(moduleName, sqlFileName);

      const [result] = await this.sequelize.query(sqlQuery, {
        replacements: params,
      });

      return {
        isError: false,
        data: result,
        error: null
      }
    } catch (error) {
      console.error(`Error {message: ${error.message},\nstack: ${error.stack}`);
      return {
        isError: true,
        data: null,
        error: {
          message: error.message,
          stack: error.stack
        }
      }
    }
  }
}
