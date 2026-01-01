import { CommonEntity } from '@common/entities/base-entity';
import {
  Entity,
  Column,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('customers')
export class Customer extends CommonEntity {
  @Column({ nullable: false })
  fullName: string;

  @Column({ nullable: false, unique: true })
  @Index()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
