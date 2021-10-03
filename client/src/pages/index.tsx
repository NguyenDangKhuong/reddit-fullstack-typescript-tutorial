import { NetworkStatus } from '@apollo/client'
import {
	Box,
	Button,
	Flex,
	Heading,
	Link,
	Spinner,
	Stack,
	Text
} from '@chakra-ui/react'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import NextLink from 'next/link'
import Layout from '../components/Layout'
import ProductEditDeleteButtons from '../components/ProductEditDeleteButtons'
import { ProductsDocument, useProductsQuery } from '../generated/graphql'
import { addApolloState, initializeApollo } from '../lib/apolloClient'
import LikeSection from '../components/LikeSection'

export const limit = 3

const Index = () => {
	const { data, loading, fetchMore, networkStatus } = useProductsQuery({
		variables: { limit },

		// component nao render boi cai Products query, se rerender khi networkStatus thay doi, tuc la fetchMore
		notifyOnNetworkStatusChange: true
	})

	const loadingMoreProducts = networkStatus === NetworkStatus.fetchMore

	const loadMoreProducts = () => fetchMore({ variables: { cursor: data?.products?.cursor } })

	return (
		<Layout>
			{loading && !loadingMoreProducts ? (
				<Flex justifyContent='center' alignItems='center' minH='100vh'>
					<Spinner />
				</Flex>
			) : (
				<Stack spacing={8}>
					{data?.products?.paginatedProducts.map(product => (
						<Flex key={product.id} p={5} shadow='md' borderWidth='1px'>
							<LikeSection product={product} />
							<Box flex={1}>
								<NextLink href={`/product/${product.id}`}>
									<Link>
										<Heading fontSize='xl'>{product.title}</Heading>
									</Link>
								</NextLink>
								<Text>producted by {product.user.username}</Text>
								<Flex align='center'>
									{/* <Text mt={4}>{product.textSnippet}</Text> */}
									<Box ml='auto'>
										<ProductEditDeleteButtons
											productId={product.id}
											productUserId={product.user.id}
										/>
									</Box>
								</Flex>
							</Box>
						</Flex>
					))}
				</Stack>
			)}

			{data?.products?.hasMore && (
				<Flex>
					<Button
						m='auto'
						my={8}
						isLoading={loadingMoreProducts}
						onClick={loadMoreProducts}
					>
						{loadingMoreProducts ? 'Đang tải' : 'Xem thêm'}
					</Button>
				</Flex>
			)}
		</Layout>
	)
}

export const getServerSideProps: GetServerSideProps = async (
	context: GetServerSidePropsContext
) => {
	const apolloClient = initializeApollo({ headers: context.req.headers })

	await apolloClient.query({
		query: ProductsDocument,
		variables: {
			limit
		}
	})

	return addApolloState(apolloClient, {
		props: {}
	})
}

export default Index
