import { Module } from '@nestjs/common';
import { TpoService } from './tpo.service';
import { TpoController } from './tpo.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [TpoController],
  providers: [TpoService],
  exports: [TpoService]
})
export class TpoModule {}
