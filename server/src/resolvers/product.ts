import { UserInputError } from 'apollo-server-core'
import {
	Arg,
	Ctx,
	FieldResolver,
	ID,
	Int,
	Mutation,
	Query,
	registerEnumType,
	Resolver,
	Root,
	UseMiddleware
} from 'type-graphql'
import { LessThan } from 'typeorm'
import { Product } from '../entities/Product'
import { Like } from '../entities/Like'
import { User } from '../entities/User'
import { checkAuth } from '../middleware/checkAuth'
import { Context } from '../types/Context'
import { CreateProductInput } from '../types/products/CreateProductInput'
import { PaginatedProducts } from '../types/products/PaginatedProducts'
import { ProductMutationResponse } from '../types/products/ProductMutationResponse'
import { UpdateProductInput } from '../types/products/UpdateProductInput'
import { LikeType } from '../types/like/LikeType'
import { Category } from '../entities/Category'

registerEnumType(LikeType, {
	name: 'LikeType' // this one is mandatory
})

@Resolver(_of => Product)
export class ProductResolver {
	// @FieldResolver(_return => String)
	// textSnippet(@Root() root: Product) {
	// 	return root.text.slice(0, 50)
	// }

	@FieldResolver(_return => User)
	async user(
		@Root() root: Product,
		@Ctx() { dataLoaders: { userLoader } }: Context
	) {
		// return await User.findOne(root.userId)
		return await userLoader.load(root.userId)
	}

	@FieldResolver(_return => Category)
  async category(@Root() rootCategory: Product) {
    return await Category.findOne(rootCategory.categoryId)
  }

	@FieldResolver(_return => Int)
	async likeType(
		@Root() root: Product,
		@Ctx() { req, dataLoaders: { likeTypeLoader } }: Context
	) {
		if (!req.session.userId) return 0
		// const existingLike = await Like.findOne({
		// 	productId: root.id,
		// 	userId: req.session.userId
		// })

		const existingLike = await likeTypeLoader.load({
			productId: root.id,
			userId: req.session.userId
		})

		return existingLike ? existingLike.value : 0
	}

	@Mutation(_return => ProductMutationResponse)
	@UseMiddleware(checkAuth)
	async createProduct(
		@Arg('createProductInput') { title, description, price, categoryId }: CreateProductInput,
		@Ctx() { req }: Context
	): Promise<ProductMutationResponse> {
		try {
			const newProduct = Product.create({
				title,
        description,
        price,
        categoryId,
        userId: req.session.userId,
			})

			await newProduct.save()

			return {
				code: 200,
				success: true,
				message: 'Thêm sản phẩm thành công',
				product: newProduct
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

	@Query(_return => PaginatedProducts, { nullable: true })
	async products(
		@Arg('limit', _type => Int) limit: number,
		@Arg('cursor', { nullable: true }) cursor?: string
	): Promise<PaginatedProducts | null> {
		try {
			const totalProductCount = await Product.count()
			const realLimit = Math.min(10, limit)

			const findOptions: { [key: string]: any } = {
				order: {
					createdAt: 'DESC'
				},
				take: realLimit
			}

			let lastProduct: Product[] = []
			if (cursor) {
				findOptions.where = { createdAt: LessThan(cursor) }

				lastProduct = await Product.find({ order: { createdAt: 'ASC' }, take: 1 })
			}

			const products = await Product.find(findOptions)

			return {
				totalCount: totalProductCount,
				cursor: products[products.length - 1].createdAt,
				hasMore: cursor
					? products[products.length - 1].createdAt.toString() !==
					  lastProduct[0].createdAt.toString()
					: products.length !== totalProductCount,
				paginatedProducts: products
			}
		} catch (error) {
			console.log(error)
			return null
		}
	}

	@Query(_return => Product, { nullable: true })
	async product(@Arg('id', _type => ID) id: number): Promise<Product | undefined> {
		try {
			const product = await Product.findOne(id)
			return product
		} catch (error) {
			console.log(error)
			return undefined
		}
	}

	@Mutation(_return => ProductMutationResponse)
	@UseMiddleware(checkAuth)
	async updateProduct(
		@Arg('updateProductInput') { id, title, description, price, categoryId }: UpdateProductInput,
		// @Ctx() { req }: Context
	): Promise<ProductMutationResponse> {
		const existingProduct = await Product.findOne(id)
		if (!existingProduct)
			return {
				code: 400,
				success: false,
				message: 'Không tìm thấy sản phẩm'
			}

		// check có phải là chính là user người đăng sản phẩm đó không
		// if (existingProduct.userId !== req.session.userId) {
		// 	return { code: 401, success: false, message: 'Lỗi bạn không phải người đăng sản phẩm này' }
		// }

		existingProduct.title = title
    existingProduct.description = description
    existingProduct.price = Number(price)
    existingProduct.categoryId = Number(categoryId)

		await existingProduct.save()

		return {
			code: 200,
			success: true,
			message: 'Đã thay đổi thông tin sản phẩm',
			product: existingProduct
		}
	}

	@Mutation(_return => ProductMutationResponse)
	@UseMiddleware(checkAuth)
	async deleteProduct(
		@Arg('id', _type => ID) id: number,
		// @Ctx() { req }: Context
	): Promise<ProductMutationResponse> {
		const existingProduct = await Product.findOne(id)
		if (!existingProduct)
			return {
				code: 400,
				success: false,
				message: 'Không tìm thấy sản phẩm'
			}

		// if (existingProduct.userId !== req.session.userId) {
		// 	return { code: 401, success: false, message: 'Lỗi bạn không phải người đăng sản phẩm này' }
		// }

		await Like.delete({productId: id})

		await Product.delete({ id })

		return { code: 200, success: true, message: 'Sản phẩm đã bị xoá' }
	}

	@Mutation(_return => ProductMutationResponse)
	@UseMiddleware(checkAuth)
	async like(
		@Arg('productId', _type => Int) productId: number,
		@Arg('inputLikeValue', _type => LikeType) inputLikeValue: LikeType,
		@Ctx()
		{
			req: {
				session: { userId }
			},
			connection
		}: Context
	): Promise<ProductMutationResponse> {
		return await connection.transaction(async transactionEntityManager => {
			// check if product exists
			let product = await transactionEntityManager.findOne(Product, productId)
			if (!product) {
				throw new UserInputError('Không tìm thấy sản phẩm')
			}

			// check if user has liked or not
			const existingLike = await transactionEntityManager.findOne(Like, {
				productId,
				userId
			})

			if (existingLike && existingLike.value !== inputLikeValue) {
				await transactionEntityManager.save(Like, {
					...existingLike,
					value: inputLikeValue
				})

				product = await transactionEntityManager.save(Product, {
					...product,
					points: product.points + 2 * inputLikeValue
				})
			}

			if (!existingLike) {
				const newLike = transactionEntityManager.create(Like, {
					userId,
					productId,
					value: inputLikeValue
				})
				await transactionEntityManager.save(newLike)

				product.points = product.points + inputLikeValue
				product = await transactionEntityManager.save(product)
			}

			return {
				code: 200,
				success: true,
				message: 'Đã thích sản phẩm',
				product
			}
		})
	}
}
