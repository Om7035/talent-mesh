import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { SkillsModule } from '../skills/skills.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
  imports: [SkillsModule, RecommendationsModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
