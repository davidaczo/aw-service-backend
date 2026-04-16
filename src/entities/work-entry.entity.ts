import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { FirebaseUser } from './firebase.user.entity';

@Entity()
@Index(['userId'])
@Index(['userId', 'createdAt'])
export class WorkEntry extends BaseEntity {
  @Column('uuid')
  userId: string;

  @ManyToOne(() => FirebaseUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: FirebaseUser;

  @Column('varchar', { length: 255 })
  categoryId: string;

  @Column('varchar', { length: 255 })
  subcategoryId: string;

  @Column('varchar', { length: 255 })
  clientName: string;

  @Column('varchar', { length: 255 })
  machineName: string;

  @Column('varchar', { length: 255 })
  machineModel: string;

  @Column('int')
  manufacturingYear: number;

  @Column('varchar', { length: 255 })
  serialNumber: string;

  @Column('int')
  operatingHours: number;

  @Column('decimal', { precision: 10, scale: 2 })
  hectares: number;
}
