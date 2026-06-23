import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ClusteringService } from '../recommendations/clustering.service';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';

describe('AdminController', () => {
  let controller: AdminController;
  let clusteringService: ClusteringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {},
        },
        {
          provide: ClusteringService,
          useValue: {
            recalculateClusters: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    clusteringService = module.get<ClusteringService>(ClusteringService);
  });

  describe('recalculateClusters', () => {
    it('should be decorated with Admin Role', () => {
      // Reflect metadata to verify the role guard is applied
      const roles = Reflect.getMetadata('roles', AdminController);
      expect(roles).toEqual([Role.ADMIN]);
    });

    it('should call ClusteringService.recalculateClusters', async () => {
      const result = await controller.recalculateClusters();
      expect(clusteringService.recalculateClusters).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });
});
