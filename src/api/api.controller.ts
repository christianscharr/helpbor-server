import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiService } from './api.service';
import { IRequest } from './dto/request.interface';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post('request')
  async newRequest(@Body() input: IRequest): Promise<any> {
    console.log(`[DEBUG] newRequest() - new request with input:\n${JSON.stringify(input, null,2)}`);
    return new Promise(async (resolve, reject) => {
      const requestId = await this.apiService.insertRequest(input);
      console.log(`[DEBUG] newRequest() - new request with id:${requestId}`);
      resolve({
        requestId: requestId
      });
    });
  }

  @Get('request')
  async getRecentRequests(): Promise<any> {
    console.log(`[DEBUG] getRecentRequests()`);
    return new Promise(async (resolve, reject) => {
      const results = await this.apiService.listRecentRequest();

      resolve({
        recentRequests: results
      });
    });
  }
}
