import { Field, ObjectType } from 'type-graphql'
import { IMutationResponse } from '../MutationResponse'
import { FieldError } from '../FieldError'
import { Category } from '../../entities/Category'

@ObjectType({ implements: IMutationResponse })
export class CategoryMutationResponse implements IMutationResponse {
  code: number
  success: boolean
  message?: string

  @Field({ nullable: true })
  category?: Category

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[]
}
