import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VonageController } from './vonage/vonage.controller';
import { VonageService } from './vonage/vonage.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ApiController } from './api/api.controller';
import { ApiService } from './api/api.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
    }),
  ],
  controllers: [AppController, VonageController, ApiController],
  providers: [AppService, VonageService, ApiService],
})
export class AppModule {}
