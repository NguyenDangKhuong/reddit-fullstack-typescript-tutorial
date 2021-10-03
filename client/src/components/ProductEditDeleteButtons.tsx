import { Box, IconButton } from '@chakra-ui/react'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import NextLink from 'next/link'
import {
	PaginatedProducts,
	useDeleteProductMutation,
	useMeQuery
} from '../generated/graphql'
import { Reference } from '@apollo/client'
import { useRouter } from 'next/router'

interface ProductEditDeleteButtonsProps {
	productId: string
	productUserId: string
}

const ProductEditDeleteButtons = ({
	productId,
	productUserId
}: ProductEditDeleteButtonsProps) => {
	const router = useRouter()
	const { data: meData } = useMeQuery()
	const [deleteProduct, _] = useDeleteProductMutation()

	const onProductDelete = async (productId: string) => {
		await deleteProduct({
			variables: { id: productId },
			update(cache, { data }) {
				if (data?.deleteProduct.success) {
					cache.modify({
						fields: {
							products(
								existing: Pick<
									PaginatedProducts,
									'__typename' | 'cursor' | 'hasMore' | 'totalCount'
								> & { paginatedProducts: Reference[] }
							) {
								const newProductsAfterDeletion = {
									...existing,
									totalCount: existing.totalCount - 1,
									paginatedProducts: existing.paginatedProducts.filter(
										productRefObject => productRefObject.__ref !== `Product:${productId}`
									)
								}

								return newProductsAfterDeletion
							}
						}
					})
				}
			}
		})

		if (router.route !== '/') router.push('/')
	}

	// if (meData?.me?.role !== 0) return null
	// if (meData?.me?.id !== productUserId) return null

	return (
		<Box>
			<NextLink href={`/product/edit/${productId}`}>
				<IconButton icon={<EditIcon />} aria-label='edit' mr={4} />
			</NextLink>

			<IconButton
				icon={<DeleteIcon />}
				aria-label='delete'
				colorScheme='red'
				onClick={onProductDelete.bind(this, productId)}
			/>
		</Box>
	)
}

export default ProductEditDeleteButtons
