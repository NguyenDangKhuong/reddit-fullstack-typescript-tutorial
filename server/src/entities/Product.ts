import { Field, ID, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Category } from './Category'
import { Like } from './Like'
import { User } from './User'

@ObjectType()
@Entity()
export class Product extends BaseEntity {
  @Field(_type => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  @Column()
  title!: string

  @Field()
  @Column()
  price!: number

  @Field()
  @Column()
  description!: string

  @Field()
  @Column()
  userId!: number

  @Field(_type => User)
  @ManyToOne(() => User, user => user.products)
  user: User

  @Field()
  @Column()
  categoryId!: number

  @Field(_type => Category)
  @ManyToOne(() => Category, category => category.products)
  category: Category

  @OneToMany(_to => Like, like => like.product)
  likes: Like[]

  @Field()
  @Column({ default: 0 })
  points!: number

  @Field()
  likeType!: number

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
