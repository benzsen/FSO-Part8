// Completed part 8.1-8.16 

const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')
const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')
const Author = require('./models/authors')
const Book = require('./models/books')
const User = require('./models/user')

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

const MONGODB_URI = 'mongodb+srv://admin-benzsen:test123@cluster0.ml9kl.mongodb.net/part8?retryWrites=true&w=majority'

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Books {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }

  type Query {
    authorCount: Int!
    bookCount: Int!
    allBooks(author: String, genre: String): [Books!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook( 
      title: String!
      published: Int
      author: String!
      genres: [String]
    ): Books
    editAuthor(
      name: String!
      setBornTo: Int!
    ):Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`

const resolvers = {
  Query: {
    me: (root, args, context) => {
      return context.currentUser
    },

    bookCount: () => {
      return Book.collection.countDocuments()
    },

    authorCount: () => Author.collection.countDocuments(),

    allBooks: async (root, args) => {

      let findArgs = {}
      let authorID

      if(args.author){
        const authorFound = await Author.find({name: args.author})
        authorID = authorFound[0].id
        findArgs = {author: authorID}
      }
      if(args.genre){
        findArgs = {genres:{$in: [args.genre]}}
      }
      if(args.author && args.genre){
        findArgs = {author: authorID, genres:{$in: [args.genre]}}
      }

    return await Book.find(findArgs).populate('author')
    },

    allAuthors: () =>  Author.find({}),
  },

  Author: {
    bookCount: async (root) => {
      let allBooks = await Book.find({}).populate('author')
      let bookCount = allBooks.filter(b => b.author.name === root.name)

      return bookCount.length
    } 
  },

  Mutation:{
    addBook: async (root, { title, author, published, genres }, context) => {
      let foundAuthor = await Author.findOne({name: author})
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      if(!foundAuthor){
          // console.log("New Author");
          
          foundAuthor = new Author({name: author})
          
          try{
            await foundAuthor.save()
          }
          catch (e) {
            throw new UserInputError(e)
          }
        }

      let book = new Book({ title, author: foundAuthor, published, genres })

      try {
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: { title, author, published, genres },
        })
      }

      book = await Book.findById(book.id).populate("author")

      return book
    },

    editAuthor: async (root, args, context) => {
      const author = await Author.findOneAndUpdate({name: args.name},{born:args.setBornTo})
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      if(!author){
        throw new UserInputError("Invalid Author")
      }

      return author
    },

    createUser: (root, args) => {
      const user = new User({
        username: args.username, 
        favoriteGenre: args.favoriteGenre
      })
  
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})