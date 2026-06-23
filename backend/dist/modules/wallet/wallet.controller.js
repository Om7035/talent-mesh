"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const wallet_service_1 = require("./wallet.service");
const wallet_dto_1 = require("./dto/wallet.dto");
const crypto = __importStar(require("crypto"));
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const client_1 = require("@prisma/client");
const common_2 = require("@nestjs/common");
let WalletController = class WalletController {
    constructor(walletService) {
        this.walletService = walletService;
    }
    getMyWallet(user) {
        return this.walletService.getWallet(user.sub);
    }
    async createDepositOrder(user, dto) {
        const amountInPaise = dto.amount * 100;
        const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
        return {
            orderId: mockOrderId,
            amount: amountInPaise,
            currency: 'INR',
        };
    }
    async verifyDeposit(user, body) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = body;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'fallback_secret')
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');
        if (expectedSignature !== razorpay_signature) {
            throw new common_2.BadRequestException('Invalid signature');
        }
        return this.walletService.deposit(user.sub, amount, razorpay_payment_id);
    }
    async handleWebhook(signature, payload) {
        if (!signature)
            throw new common_2.BadRequestException('Missing signature');
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'fallback_secret')
            .update(JSON.stringify(payload))
            .digest('hex');
        if (expectedSignature !== signature) {
            throw new common_2.BadRequestException('Invalid webhook signature');
        }
        if (payload.event === 'payment.captured') {
            const amount = payload.payload.payment.entity.amount / 100;
            const paymentId = payload.payload.payment.entity.id;
            const notes = payload.payload.payment.entity.notes || {};
            if (notes.userId) {
                try {
                    await this.walletService.deposit(notes.userId, amount, paymentId);
                    console.log(`Webhook: Payment ${paymentId} captured for user ${notes.userId}`);
                }
                catch (err) {
                    if (err.message === 'Duplicate payment') {
                        console.log(`Webhook: Payment ${paymentId} already processed.`);
                        return { status: 'ok', note: 'Idempotency caught duplicate' };
                    }
                    throw err;
                }
            }
        }
        return { status: 'ok' };
    }
    withdraw(user, dto) {
        return this.walletService.withdraw(user.sub, dto.amount);
    }
    getTransactions(user, page = 1, limit = 20) {
        return this.walletService.getTransactions(user.sub, Number(page), Number(limit));
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current wallet balance and recent transactions' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "getMyWallet", null);
__decorate([
    (0, common_1.Post)('deposit-order'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Create Razorpay Order for Deposit' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.DepositDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "createDepositOrder", null);
__decorate([
    (0, common_1.Post)('deposit-verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify Razorpay Payment and deposit funds' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "verifyDeposit", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('razorpay-webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Razorpay Webhook listener with idempotency' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: Object }),
    __param(0, (0, common_2.Headers)('x-razorpay-signature')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Post)('withdraw'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT, client_1.Role.CLIENT),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Withdraw funds from wallet' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.WithdrawDto]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get paginated transaction history' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "getTransactions", null);
exports.WalletController = WalletController = __decorate([
    (0, swagger_1.ApiTags)('wallet'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)('wallet'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map