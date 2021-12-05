
const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')
const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')
const Author = require('./models/authors')
const Book = require('./models/books')

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

const MONGODB_URI = 'mongodb+srv://admin-benzsen:test123@cluster0.ml9kl.mongodb.net/part8?retryWrites=true&w=majority'

console.log('connecting to', MONGODB_URI)

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

  type Query {
    authorCount: Int!
    bookCount: Int!
    allBooks(author: String, genre: String): [Books!]!
    allAuthors: [Author!]!
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
  }
`

const resolvers = {
  Query: {
    bookCount: () => {
      console.log("count", Book.collection.countDocuments())
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

    allAuthors: () =>  Author.find({})
  },

  Author: {
    bookCount: async (root) => {
      let allBooks = await Book.find({}).populate('author')
      let bookCount = allBooks.filter(b => b.author.name === root.name)

      return bookCount.length
    } 
  },

  Mutation:{
    addBook: async (root, { title, author, published, genres }) => {
      let foundAuthor = await Author.findOne({name: author})

      if(!foundAuthor){
          console.log("New Author");
          
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

    editAuthor: async (root, args) => {

      const author = await Author.findOneAndUpdate({name: args.name},{born:args.setBornTo})

      if(!author){
        throw new UserInputError("Invalid Author")
      }

      return author
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})