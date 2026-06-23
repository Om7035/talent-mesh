import { Module } from '@nestjs/common';
import { TpoService } from './tpo.service';
import { TpoController } from './tpo.controller';

@Module({
  controllers: [TpoController],
  providers: [TpoService],
  exports: [TpoService]
})
export class TpoModule {}
