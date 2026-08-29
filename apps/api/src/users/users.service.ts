import { Injectable, NotImplementedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      // Never select passwordHash — this response goes straight to the client.
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
    });
  }

  updateProfile(_userId: string, _data: Record<string, unknown>) {
    throw new NotImplementedException("users.updateProfile: TODO — validate + upsert UserProfile");
  }

  updateSettings(_userId: string, _data: Record<string, unknown>) {
    throw new NotImplementedException("users.updateSettings: TODO — locale, notification prefs");
  }
}
