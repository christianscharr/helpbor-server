import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VonageController } from './vonage/vonage.controller';
import { VonageService } from './vonage/vonage.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
    }),
  ],
  controllers: [AppController, VonageController],
  providers: [AppService, VonageService],
})
export class AppModule {}
