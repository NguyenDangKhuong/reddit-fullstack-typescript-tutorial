import {
	Alert,
	AlertIcon,
	AlertTitle,
	Box,
	Button,
	Flex,
	Heading,
	Spinner
} from '@chakra-ui/react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import {
	ProductDocument,
	ProductIdsDocument,
	ProductIdsQuery,
	ProductQuery,
	useProductQuery
} from '../../generated/graphql'
import { addApolloState, initializeApollo } from '../../lib/apolloClient'
import { limit } from '../index'
import NextLink from 'next/link'
// import ProductEditDeleteButtons from '../../components/ProductEditDeleteButtons'

const Product = () => {
	const router = useRouter()
	const { data, loading, error } = useProductQuery({
		variables: { id: router.query.id as string }
	})

	if (loading)
		return (
			<Layout>
				<Flex justifyContent='center' alignItems='center' minH='100vh'>
					<Spinner />
				</Flex>
			</Layout>
		)

	if (error || !data?.product)
		return (
			<Layout>
				<Alert status='error'>
					<AlertIcon />
					<AlertTitle>{error ? error.message : 'Product not found'}</AlertTitle>
				</Alert>
				<Box mt={4}>
					<NextLink href='/'>
						<Button>Back to Homepage</Button>
					</NextLink>
				</Box>
			</Layout>
		)

	return (
		<Layout>
			<Heading mb={4}>{data.product.title}</Heading>
			<Box mb={4}>{data.product.text}</Box>
			<Flex justifyContent='space-between' alignItems='center'>
				{/* <ProductEditDeleteButtons
					productId={data.product.id}
					productUserId={data.product.userId.toString()}
				/> */}
				<NextLink href='/'>
					<Button>Back to Homepage</Button>
				</NextLink>
			</Flex>
		</Layout>
	)
}

export const getStaticPaths: GetStaticPaths = async () => {
	// [
	//   { params: { id: '15'} },
	//   { params: { id: '16'} }
	// ]

	const apolloClient = initializeApollo()

	const { data } = await apolloClient.query<ProductIdsQuery>({
		query: ProductIdsDocument,
		variables: { limit }
	})

	return {
		paths: data.products!.paginatedProducts.map(product => ({
			params: { id: `${product.id}` }
		})),
		fallback: 'blocking'
	}
}

export const getStaticProps: GetStaticProps<
	{ [key: string]: any },
	{ id: string }
> = async ({ params }) => {
	const apolloClient = initializeApollo()

	await apolloClient.query<ProductQuery>({
		query: ProductDocument,
		variables: { id: params?.id }
	})

	return addApolloState(apolloClient, { props: {} })
}

export default Product
