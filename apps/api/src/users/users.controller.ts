import { Body, Controller, Get, Patch } from "@nestjs/common";
import { CurrentUser, type AuthenticatedUser } from "../common/decorators/current-user.decorator.js";
import { UsersService } from "./users.service.js";

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.users.getProfile(user.id);
  }

  @Patch("me")
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() body: Record<string, unknown>) {
    return this.users.updateProfile(user.id, body);
  }

  @Patch("me/settings")
  updateSettings(@CurrentUser() user: AuthenticatedUser, @Body() body: Record<string, unknown>) {
    return this.users.updateSettings(user.id, body);
  }
}
