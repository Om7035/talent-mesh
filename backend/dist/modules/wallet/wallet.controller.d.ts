import { WalletService } from './wallet.service';
import { DepositDto, WithdrawDto } from './dto/wallet.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getMyWallet(user: JwtPayload): Promise<{
        transactions: {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            description: string | null;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            walletId: string;
            reference: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        balance: import("@prisma/client/runtime/library").Decimal;
        lockedBalance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        bankName: string | null;
        accountNumber: string | null;
        routingNumber: string | null;
        upiId: string | null;
        payoutMethod: string;
    }>;
    createDepositOrder(user: JwtPayload, dto: DepositDto): Promise<{
        orderId: string;
        amount: number;
        currency: string;
    }>;
    verifyDeposit(user: JwtPayload, body: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        balance: import("@prisma/client/runtime/library").Decimal;
        lockedBalance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        bankName: string | null;
        accountNumber: string | null;
        routingNumber: string | null;
        upiId: string | null;
        payoutMethod: string;
    }>;
    handleWebhook(signature: string, payload: any): Promise<{
        status: string;
        note: string;
    } | {
        status: string;
        note?: undefined;
    }>;
    withdraw(user: JwtPayload, dto: WithdrawDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        balance: import("@prisma/client/runtime/library").Decimal;
        lockedBalance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        bankName: string | null;
        accountNumber: string | null;
        routingNumber: string | null;
        upiId: string | null;
        payoutMethod: string;
    }>;
    getTransactions(user: JwtPayload, page?: number, limit?: number): Promise<{
        transactions: {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            description: string | null;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            walletId: string;
            reference: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
