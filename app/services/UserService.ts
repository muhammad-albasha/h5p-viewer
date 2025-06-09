import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/User';
import { getDataSource } from '../lib/datasource';
import bcrypt from 'bcrypt';

export class UserService {
  private userRepository!: Repository<User>;

  private async getRepository(): Promise<Repository<User>> {
    if (!this.userRepository) {
      const dataSource = await getDataSource();
      this.userRepository = dataSource.getRepository(User);
    }
    return this.userRepository;
  }  async findAll(): Promise<User[]> {
    const repo = await this.getRepository();
    return repo.find({
      select: ['id', 'username', 'email', 'role', 'twoFactorEnabled', 'twoFactorSecret', 'createdAt', 'updatedAt']
    });
  }  async findById(id: number): Promise<User | null> {
    const repo = await this.getRepository();
    return repo.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'password', 'role', 'twoFactorEnabled', 'twoFactorSecret', 'createdAt', 'updatedAt']
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    const repo = await this.getRepository();
    return repo.findOne({ where: { username } });
  }
  async findByEmail(email: string): Promise<User | null> {
    const repo = await this.getRepository();
    return repo.findOne({ 
      where: { email },
      select: ['id', 'username', 'email', 'password', 'role', 'twoFactorEnabled', 'twoFactorSecret', 'createdAt', 'updatedAt']
    });
  }

  async create(userData: { username: string; email: string; password: string; role?: UserRole }): Promise<User> {
    const repo = await this.getRepository();
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      const user = repo.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || UserRole.USER
    });
    
    return repo.save(user);
  }

  async update(id: number, updateData: { username?: string; email?: string; password?: string; role?: UserRole; twoFactorEnabled?: boolean; twoFactorSecret?: string | null }): Promise<User | null> {
    const repo = await this.getRepository();
    
    const updatePayload: any = { ...updateData };
    
    // Hash password if provided
    if (updateData.password) {
      const saltRounds = 10;
      updatePayload.password = await bcrypt.hash(updateData.password, saltRounds);
    }
    
    await repo.update(id, updatePayload);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const repo = await this.getRepository();
    const result = await repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
  async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const isValidPassword = await this.validatePassword(user, password);
    
    if (isValidPassword) {
      return user;
    }
    
    return null;
  }
  async initializeDefaultUsers(): Promise<void> {
    const repo = await this.getRepository();
    
    // Check if admin user exists
    const adminUser = await repo.findOne({ where: { username: 'admin' } });
    
    if (!adminUser) {
      await this.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123', // Change this in production!
        role: UserRole.ADMIN
      });
      console.log('Default admin user created');
    }

    // Check if regular user exists
    const regularUser = await repo.findOne({ where: { username: 'user' } });
    
    if (!regularUser) {
      await this.create({
        username: 'user',
        email: 'user@example.com',
        password: 'user123', // Change this in production!
        role: UserRole.USER
      });
      console.log('Default regular user created');
    }
  }
}
