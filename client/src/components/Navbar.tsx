import { Box, Flex, Heading, Link, Button } from '@chakra-ui/react'
import NextLink from 'next/link'
import {
	MeDocument,
	MeQuery,
	useLogoutMutation,
	useMeQuery
} from '../generated/graphql'
import { Reference, gql } from '@apollo/client'

const Navbar = () => {
	const { data, loading: useMeQueryLoading } = useMeQuery()
	const [logout, { loading: useLogoutMutationLoading }] = useLogoutMutation()

	const logoutUser = async () => {
		await logout({
			update(cache, { data }) {
				if (data?.logout) {
					cache.writeQuery<MeQuery>({
						query: MeDocument,
						data: { me: null }
					})

					cache.modify({
						fields: {
							products(existing) {
								existing.paginatedProducts.forEach((product: Reference) => {
									cache.writeFragment({
										id: product.__ref, // `Product:17`
										fragment: gql`
											fragment LikeType on Product {
												likeType
											}
										`,
										data: {
											likeType: 0
										}
									})
								})

								return existing
							}
						}
					})
				}
			}
		})
	}

	let body

	if (useMeQueryLoading) {
		body = null
	} else if (!data?.me) {
		body = (
			<>
				<NextLink href='/login'>
					<Link mr={2}>Đăng nhập</Link>
				</NextLink>
				<NextLink href='/register'>
					<Link>Đăng kí</Link>
				</NextLink>
			</>
		)
	} else {
		body = (
			<Flex>
				<NextLink href='/create-product'>
					<Button mr={4}>Tạo sản phẩm</Button>
				</NextLink>
				<Button onClick={logoutUser} isLoading={useLogoutMutationLoading}>
					Đăng xuất
				</Button>
			</Flex>
		)
	}

	return (
		<Box bg='tan' p={4}>
			<Flex maxW={800} justifyContent='space-between' align='center' m='auto'>
				<NextLink href='/'>
					<Heading>Rắc Rối Shop</Heading>
				</NextLink>
				<Box>{body}</Box>
			</Flex>
		</Box>
	)
}

export default Navbar
