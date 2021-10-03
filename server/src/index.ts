require('dotenv').config()
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { ApolloServer } from 'apollo-server-express'
import MongoStore from 'connect-mongo'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import mongoose from 'mongoose'
import path from 'path'
import 'reflect-metadata'
import { buildSchema } from 'type-graphql'
import { createConnection } from 'typeorm'
import { COOKIE_NAME, __prod__ } from './constants'
import { Category } from './entities/Category'
import { Like } from './entities/Like'
import { Product } from './entities/Product'
import { User } from './entities/User'
import { CategoryResolver } from './resolvers/category'
import { HelloResolver } from './resolvers/hello'
import { ProductResolver } from './resolvers/product'
import { UserResolver } from './resolvers/user'
import { Context } from './types/Context'
import { buildDataLoaders } from './utils/dataLoaders'
import { sendEmail } from './utils/sendEmail'

const main = async () => {
	const connection = await createConnection({
		type: 'postgres',
		...(__prod__
			? { url: process.env.DATABASE_URL }
			: {
					database: 'racroishop',
					username: process.env.DB_USERNAME_DEV,
					password: process.env.DB_PASSWORD_DEV
			  }),
		logging: true,
		...(__prod__
			? {
					extra: {
						ssl: {
							rejectUnauthorized: false
						}
					},
					ssl: true
			  }
			: {}),
		...(__prod__ ? {} : { synchronize: true }),
		entities: [User, Product, Like, Category],
		migrations: [path.join(__dirname, '/migrations/*')]
	})

	await sendEmail('khuong@gmail.com', '<b>Hello Khuong</b>')

	if (__prod__) await connection.runMigrations()

	const app = express()

	app.use(
		cors({
			origin: 'http://localhost:3001',
			credentials: true
		})
	)

	// Session/Cookie store
	const mongoUrl = `mongodb+srv://${process.env.SESSION_DB_USERNAME_DEV_PROD}:${process.env.SESSION_DB_PASSWORD_DEV_PROD}@racroishop.c68ga.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
	await mongoose.connect(mongoUrl, {
		useCreateIndex: true,
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	})

	console.log('MongoDB Connected')

	app.set('trust proxy', 1)

	app.use(
		session({
			name: COOKIE_NAME,
			store: MongoStore.create({ mongoUrl }),
			cookie: {
				maxAge: 1000 * 60 * 60, // one hour
				httpOnly: true, // JS front end cannot access the cookie
				secure: __prod__, // cookie only works in https
				sameSite: 'lax'
			},
			secret: process.env.SESSION_SECRET_DEV_PROD as string,
			saveUninitialized: false, // don't save empty sessions, right from the start
			resave: false
		})
	)

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, UserResolver, ProductResolver, CategoryResolver],
			validate: false
		}),
		context: ({ req, res }): Context => ({
			req,
			res,
			connection,
			dataLoaders: buildDataLoaders()
		}),
		plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
	})

	await apolloServer.start()

	apolloServer.applyMiddleware({ app, cors: false })

	const PORT = process.env.PORT || 4000
	app.listen(PORT, () =>
		console.log(
			`Server started on port ${PORT}. GraphQL server started on localhost:${PORT}${apolloServer.graphqlPath}`
		)
	)
}

main().catch(error => console.log(error))
