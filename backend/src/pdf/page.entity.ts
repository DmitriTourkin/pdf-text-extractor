import { FileEntity } from "src/upload/file.entity";
import { 
  Entity, 
  PrimaryGeneratedColumn,
  Column,
  ManyToOne
} from "typeorm";


@Entity('pages')
export class PageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pageNumber: number;

  @Column({ type: 'text' })
  textContent: string;

  @ManyToOne(() => FileEntity, { onDelete: 'CASCADE'})
  file: FileEntity
}