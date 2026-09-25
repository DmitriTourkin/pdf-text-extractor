import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  private buildToken(user: UserEntity) {
    const payload = { sub: user.id, email: user.email };
    
    return {
      accessToken: this.jwtService.sign(payload)
    };
  }

  async register(email: string, password: string): Promise<{ accessToken: string }>{
    const existingUser = await this.usersRepository.findOne({ where: { email }});
    
    if (existingUser) {
      throw new ConflictException('Пользователь с такими email уже существует.')
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = this.usersRepository.create({ email, passwordHash });
    await this.usersRepository.save(user);
    
    return this.buildToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findOne({ where: { email }});
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    return this.buildToken(user);
  }
}
