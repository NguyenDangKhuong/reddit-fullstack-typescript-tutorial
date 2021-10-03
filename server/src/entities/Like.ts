import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Product } from './Product'
import { User } from './User'

@Entity()
export class Like extends BaseEntity {
  @PrimaryColumn()
  userId!: number

  @ManyToOne(_to => User, user => user.likes)
  user!: User

  @PrimaryColumn()
  productId!: number

  @ManyToOne(_to => Product, product => product.likes)
  product!: Product

  @Column()
  value!: number
}
