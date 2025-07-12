import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("contacts")
export class Contact {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;
  @Column({ type: "varchar", length: 255, nullable: true })
  position?: string;

  @Column({ type: "varchar", length: 255 })
  department!: string;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone?: string;

  @Column({
    type: "varchar",
    length: 500,
    default: "/assets/placeholder-image.svg",
  })
  photo!: string;

  @Column({ type: "text", nullable: true })
  bio?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  office?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  linkedin?: string;

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
