import { PrismaService } from '../../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';
export declare class ContractsCronService {
    private readonly prisma;
    private readonly walletService;
    private readonly logger;
    constructor(prisma: PrismaService, walletService: WalletService);
    handleUnfundedTimeouts(): Promise<void>;
    handleAutoApprovals(): Promise<void>;
}
