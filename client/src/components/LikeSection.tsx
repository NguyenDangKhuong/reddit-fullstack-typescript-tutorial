import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { Flex, IconButton } from '@chakra-ui/react'
import { useState } from 'react'
import {
	ProductWithCategoryInfoFragment,
	useLikeMutation,
	LikeType
} from '../generated/graphql'

interface LikeSectionProps {
	product: ProductWithCategoryInfoFragment
}

enum LikeTypeValues {
	Like = 1,
	Dislike = -1
}

const LikeSection = ({ product }: LikeSectionProps) => {
	const [like, { loading }] = useLikeMutation()

	const [loadingState, setLoadingState] = useState<
		'like-loading' | 'dislike-loading' | 'not-loading'
	>('not-loading')

	const onClickLike = async (productId: string) => {
		setLoadingState('like-loading')
		await like({
			variables: { inputLikeValue: LikeType.Like, productId: parseInt(productId) }
		})
		setLoadingState('not-loading')
	}

	const onClickDislike = async (productId: string) => {
		setLoadingState('dislike-loading')
		await like({
			variables: { inputLikeValue: LikeType.Dislike, productId: parseInt(productId) }
		})
		setLoadingState('not-loading')
	}

	return (
		<Flex direction='column' alignItems='center' mr={4}>
			<IconButton
				icon={<ChevronUpIcon />}
				aria-label='like'
				onClick={
					product.likeType === LikeTypeValues.Like
						? undefined
						: onClickLike.bind(this, product.id)
				}
				isLoading={loading && loadingState === 'like-loading'}
				colorScheme={
					product.likeType === LikeTypeValues.Like ? 'green' : undefined
				}
			/>
			{product.points}
			<IconButton
				icon={<ChevronDownIcon />}
				aria-label='dislike'
				onClick={
					product.likeType === LikeTypeValues.Dislike
						? undefined
						: onClickDislike.bind(this, product.id)
				}
				isLoading={loading && loadingState === 'dislike-loading'}
				colorScheme={
					product.likeType === LikeTypeValues.Dislike ? 'red' : undefined
				}
			/>
		</Flex>
	)
}

export default LikeSection
