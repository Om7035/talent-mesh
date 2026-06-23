"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TpoModule = void 0;
const common_1 = require("@nestjs/common");
const tpo_service_1 = require("./tpo.service");
const tpo_controller_1 = require("./tpo.controller");
let TpoModule = class TpoModule {
};
exports.TpoModule = TpoModule;
exports.TpoModule = TpoModule = __decorate([
    (0, common_1.Module)({
        controllers: [tpo_controller_1.TpoController],
        providers: [tpo_service_1.TpoService],
        exports: [tpo_service_1.TpoService]
    })
], TpoModule);
//# sourceMappingURL=tpo.module.js.map