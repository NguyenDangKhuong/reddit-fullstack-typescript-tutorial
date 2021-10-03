import DataLoader from 'dataloader'
import { Like } from '../entities/Like'
import { User } from '../entities/User'

interface LikeTypeCondition {
  productId: number
  userId: number
}

// [1, 2]
// users === [{id: 1}, {id: 2}]
// FALSE: users === [{id: 2}, {id: 1}]
const batchGetUsers = async (userIds: number[]) => {
  const users = await User.findByIds(userIds)
  return userIds.map(userId => users.find(user => user.id === userId))
}

// SELECT * FROM Uplike WHERE [productId, userId] IN ([[19, 1], [18, 1], [17, 1]])

const batchGetLikeTypes = async (likeTypeConditions: LikeTypeCondition[]) => {
  const likeTypes = await Like.findByIds(likeTypeConditions)
  return likeTypeConditions.map(likeTypeCondition =>
    likeTypes.find(
      likeType =>
        likeType.productId === likeTypeCondition.productId &&
        likeType.userId === likeTypeCondition.userId
    )
  )
}

export const buildDataLoaders = () => ({
  userLoader: new DataLoader<number, User | undefined>(userIds =>
    batchGetUsers(userIds as number[])
  ),
  likeTypeLoader: new DataLoader<LikeTypeCondition, Like | undefined>(
    likeTypeConditions =>
      batchGetLikeTypes(likeTypeConditions as LikeTypeCondition[])
  )
})
