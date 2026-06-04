import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { Business } from '../../domain/entities/business.entity';
import { User } from '../../domain/entities/user.entity';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { AuthUser, JwtPayload } from '../utils/auth.types';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Business)
    private readonly businesses: Repository<Business>,
    private readonly dataSource: DataSource,
    private readonly jwt: JwtService,
  ) {}

  async profile(user: AuthUser) {
    const business = await this.businesses.findOne({
      where: { id: user.businessId },
    });
    return {
      email: user.email,
      businessId: user.businessId,
      businessName: business?.name ?? 'Mi negocio',
      currency: business?.currency ?? 'COP',
    };
  }

  async register(dto: RegisterDto): Promise<AuthUser> {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const user = await this.dataSource.transaction(async (manager) => {
      const business = await manager.save(
        manager.create(Business, { name: dto.businessName }),
      );
      return manager.save(
        manager.create(User, {
          email: dto.email,
          passwordHash: await bcrypt.hash(dto.password, SALT_ROUNDS),
          businessId: business.id,
        }),
      );
    });

    return this.toAuthUser(user);
  }

  async validate(dto: LoginDto): Promise<AuthUser> {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.toAuthUser(user);
  }

  signToken(user: AuthUser): string {
    const payload: JwtPayload = {
      sub: user.userId,
      email: user.email,
      businessId: user.businessId,
    };
    return this.jwt.sign(payload);
  }

  private toAuthUser(user: User): AuthUser {
    return {
      userId: user.id,
      email: user.email,
      businessId: user.businessId,
    };
  }
}
