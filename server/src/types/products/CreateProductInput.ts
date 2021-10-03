import { Field, InputType } from 'type-graphql'

@InputType()
export class CreateProductInput {
  @Field()
  title: string

  @Field()
  description: string

  @Field()
  price: number

  @Field()
  categoryId: number
}
