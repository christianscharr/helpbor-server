import { Injectable } from '@nestjs/common';
import { Connection, r } from 'rethinkdb-ts';
import { IRequest } from './dto/request.interface';

@Injectable()
export class ApiService {
  private async getConnection(): Promise<Connection> {
    return r.connect({
      host: process.env.RETHINKDB_HOST,
      port: parseInt(process.env.RETHINKDB_PORT),
      db: 'helpbor'
    });
  }

  async insertRequest(call: IRequest): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const rConn = await this.getConnection();

      const result = await r.table('requests').insert(call, {
        returnChanges: false,
        conflict: 'replace'
      }).run(rConn);

      rConn.close();

      if (result.errors > 0) {
        const errMsg = `[ERROR] insertRequest() - Failed to persist request with ${result.errors} errors:\n${result.first_error}`;
        console.error(errMsg);
        reject(errMsg);
        return;
      }

      resolve(result.generated_keys[0]);
    });
  }

  async listRecentRequest(): Promise<any[]> {
    return new Promise<any[]>(async (resolve, reject) => {
      const rConn = await this.getConnection();

      const results = await r.table('requests')
        .orderBy(r.desc('timestamp'))
        .limit(25)
        .run(rConn);

      rConn.close();

      resolve(results);
    });
  }
}