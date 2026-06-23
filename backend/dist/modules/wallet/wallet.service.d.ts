import { PrismaService } from '../../database/prisma.service';
export declare class WalletService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getWallet(userId: string): Promise<{
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
    deposit(userId: string, amount: number, referenceId?: string): Promise<{
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
    withdraw(userId: string, amount: number): Promise<{
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
    getTransactions(userId: string, page?: number, limit?: number): Promise<{
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
    lockEscrow(clientUserId: string, contractId: string, amount: number): Promise<{
        wallet: {
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
        };
        escrow: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            contractId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            platformFee: import("@prisma/client/runtime/library").Decimal;
            isFunded: boolean;
            isReleased: boolean;
            fundedAt: Date | null;
            releasedAt: Date | null;
            walletId: string;
        };
    }>;
    releaseEscrow(contractId: string, studentUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        contractId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        platformFee: import("@prisma/client/runtime/library").Decimal;
        isFunded: boolean;
        isReleased: boolean;
        fundedAt: Date | null;
        releasedAt: Date | null;
        walletId: string;
    }>;
    refundEscrow(contractId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        contractId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        platformFee: import("@prisma/client/runtime/library").Decimal;
        isFunded: boolean;
        isReleased: boolean;
        fundedAt: Date | null;
        releasedAt: Date | null;
        walletId: string;
    }>;
}
