import { Field, ObjectType } from 'type-graphql'
import { IMutationResponse } from '../MutationResponse'
import { FieldError } from '../FieldError'
import { Product } from '../../entities/Product'

@ObjectType({ implements: IMutationResponse })
export class ProductMutationResponse implements IMutationResponse {
  code: number
  success: boolean
  message?: string

  @Field({ nullable: true })
  product?: Product

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[]
}
