import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import {
	UpdateProductInput,
	useMeQuery,
	useProductQuery,
	useUpdateProductMutation
} from '../../../generated/graphql'
import {
	Alert,
	AlertIcon,
	AlertTitle,
	Box,
	Button,
	Flex,
	Spinner
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { Formik, Form } from 'formik'
import InputField from '../../../components/InputField'

const ProductEdit = () => {
	const router = useRouter()
	const productId = router.query.id as string

	const { data: meData, loading: meLoading } = useMeQuery()

	const { data: productData, loading: productLoading } = useProductQuery({
		variables: { id: productId }
	})

	const [updateProduct, _] = useUpdateProductMutation()

	const onUpdateProductSubmit = async (values: Omit<UpdateProductInput, 'id'>) => {
		await updateProduct({
			variables: {
				updateProductInput: {
					id: productId,
					...values
				}
			}
		})
		router.back()
	}

	if (meLoading || productLoading)
		return (
			<Layout>
				<Flex justifyContent='center' alignItems='center' minH='100vh'>
					<Spinner />
				</Flex>
			</Layout>
		)

	if (!productData?.product)
		return (
			<Layout>
				<Alert status='error'>
					<AlertIcon />
					<AlertTitle>Product not found</AlertTitle>
				</Alert>
				<Box mt={4}>
					<NextLink href='/'>
						<Button>Back to Homepage</Button>
					</NextLink>
				</Box>
			</Layout>
		)

		if (
			!meLoading &&
			!productLoading &&
			!meData?.me?.id


			// kiểm tra xem có phải sản phẩm chính chủ không
			// !== productData?.product?.userId.toString()
		)
		return (
			<Layout>
				<Alert status='error'>
					<AlertIcon />
					<AlertTitle>Unauthorised</AlertTitle>
				</Alert>
				<Box mt={4}>
					<NextLink href='/'>
						<Button>Back to Homepage</Button>
					</NextLink>
				</Box>
			</Layout>
		)

	const initialValues = {
		title: productData.product.title,
    description: productData.product.description,
    price: productData.product.price,
    categoryId: productData.product.categoryId
	}

	return (
		<Layout>
			<Formik initialValues={initialValues} onSubmit={onUpdateProductSubmit}>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name='title'
							placeholder='Title'
							label='Title'
							type='text'
						/>

						<Box mt={4}>
							<InputField
								textarea
								name='text'
								placeholder='Text'
								label='Text'
								type='textarea'
							/>
						</Box>

						<Flex justifyContent='space-between' alignItems='center' mt={4}>
							<Button type='submit' colorScheme='teal' isLoading={isSubmitting}>
								Update Product
							</Button>
							<NextLink href='/'>
								<Button>Back to Homepage</Button>
							</NextLink>
						</Flex>
					</Form>
				)}
			</Formik>
		</Layout>
	)
}

export default ProductEdit
