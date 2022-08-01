import { Body, Controller, Post, Req, UseGuards, ValidationPipe } from "@nestjs/common";
import { throwHttpResponse } from "src/helpers/throwHttpResponse.ts";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";

@Controller()
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    async signup(@Body(new ValidationPipe()) body: CreateUserDto) {
        if (body.password !== body.repeatPassword) return throwHttpResponse(400, 'Passwords need be equals');
        const data = {
            name: body.name,
            email: body.email,
            password: body.password
        }

        return await this.authService.signup(data);
    }

    @UseGuards(LocalAuthGuard)
    @Post('signin')
    async signin(@Req() req: any) {
        if (req.user) return this.authService.login(req.user);
    }
}