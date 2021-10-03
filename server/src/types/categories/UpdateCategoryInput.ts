import { Field, ID, InputType } from 'type-graphql'

@InputType()
export class UpdateCategoryInput {
  @Field((_type) => ID)
  id: number

  @Field()
  title: string
}
