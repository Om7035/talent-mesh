export declare class SignupDto {
    name: string;
    email: string;
    password: string;
    role: 'STUDENT' | 'CLIENT' | 'RECRUITER';
    collegeId?: string;
    departmentId?: string;
    yearOfStudy?: number;
    companyName?: string;
    industry?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
