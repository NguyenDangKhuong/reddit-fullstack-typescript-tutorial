import { Product } from '../entities/Product'
import {
  Arg,
  FieldResolver,
  ID,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware
} from 'type-graphql'
import { Category } from '../entities/Category'
import { checkAuth } from '../middleware/checkAuth'
import { CategoryMutationResponse } from '../types/categories/CategoryMutationResponse'
import { CreateCategoryInput } from '../types/categories/CreateCategoryInput'
import { UpdateCategoryInput } from '../types/categories/UpdateCategoryInput'

@Resolver(_of => Category)
export class CategoryResolver {
  @FieldResolver(_return => [Product])
  async products(@Root() rootCategory: Category) {
    return await Product.find({ categoryId: rootCategory.id })
  }

  @Mutation(_returns => CategoryMutationResponse)
  @UseMiddleware(checkAuth)
  async createCategory(
    @Arg('createCategoryInput')
    { title }: CreateCategoryInput
  ): Promise<CategoryMutationResponse> {
    try {
      const newCategory = Category.create({
        title
        // userId: req.session.userId,
      })

      await newCategory.save()

      return {
        code: 200,
        success: true,
        message: 'Thêm danh mục thành công',
        category: newCategory
      }
    } catch (error) {
      console.log(error)
      return {
        code: 500,
        success: false,
        message: `Lỗi hệ thống: ${error.message}`
      }
    }
  }

  @Query(_return => [Category], { nullable: true })
  @UseMiddleware(checkAuth)
  async categories(): Promise<Category[] | null> {
    try {
      return await Category.find()
    } catch (error) {
      console.log(error)
      return null
    }
  }

  @Query(_return => Category, { nullable: true })
  @UseMiddleware(checkAuth)
  async category(
    @Arg('id', _type => ID) id: number
  ): Promise<Category | undefined> {
    try {
      const category = await Category.findOne(id)
      return category
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  @Mutation(_return => CategoryMutationResponse)
  @UseMiddleware(checkAuth)
  async updateCategory(
    @Arg('updateCategoryInput')
    { id, title }: UpdateCategoryInput
  ): Promise<CategoryMutationResponse> {
    const existingCategory = await Category.findOne(id)

    if (!existingCategory)
      return {
        code: 400,
        success: false,
        message: 'Không tìm thấy danh mục'
      }

    existingCategory.title = title

    await existingCategory.save()

    return {
      code: 200,
      success: true,
      message: 'Đã thay đổi thông tin danh mục',
      category: existingCategory
    }
  }

  @Mutation(_return => CategoryMutationResponse)
  @UseMiddleware(checkAuth)
  async deleteCategory(
    @Arg('id', _type => ID) id: number
  ): Promise<CategoryMutationResponse> {
    const existingCategory = await Category.findOne(id)

    if (!existingCategory)
      return {
        code: 400,
        success: false,
        message: 'Không tìm thấy danh mục'
      }
    await Category.delete({ id })
    return { code: 200, success: true, message: 'Danh mục đã bị xoá' }
  }
}
