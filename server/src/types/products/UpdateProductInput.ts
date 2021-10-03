import { Field, ID, InputType } from 'type-graphql'

@InputType()
export class UpdateProductInput {
  @Field(_type => ID)
  id: number

  @Field()
  title: string

  @Field()
  description: string

  @Field()
  price: number

  @Field()
  categoryId: number
}
