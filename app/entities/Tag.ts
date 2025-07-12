import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from "typeorm";

@Entity("tags")
export class Tag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, unique: true })
  name!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
