
const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')
const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')
const Author = require('./models/authors')
const Book = require('./models/books')

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

const MONGODB_URI = 'mongodb+srv://admin-benzsen:test123@cluster0.ml9kl.mongodb.net/part8?retryWrites=true&w=majority'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

// let authors = [
//   {
//     name: 'Robert Martin',
//     id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
//     born: 1952,
//   },
//   {
//     name: 'Martin Fowler',
//     id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
//     born: 1963
//   },
//   {
//     name: 'Fyodor Dostoevsky',
//     id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
//     born: 1821
//   },
//   { 
//     name: 'Joshua Kerievsky', // birthyear not known
//     id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
//   },
//   { 
//     name: 'Sandi Metz', // birthyear not known
//     id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
//   },
// ]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's name in the context of the book instead of the author's id
 * However, for simplicity, we will store the author's name in connection with the book
*/

// let books = [
//   {
//     title: 'Clean Code',
//     published: 2008,
//     author: 'Robert Martin',
//     id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring']
//   },
//   {
//     title: 'Agile software development',
//     published: 2002,
//     author: 'Robert Martin',
//     id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
//     genres: ['agile', 'patterns', 'design']
//   },
//   {
//     title: 'Refactoring, edition 2',
//     published: 2018,
//     author: 'Martin Fowler',
//     id: "afa5de00-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring']
//   },
//   {
//     title: 'Refactoring to patterns',
//     published: 2008,
//     author: 'Joshua Kerievsky',
//     id: "afa5de01-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring', 'patterns']
//   },  
//   {
//     title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
//     published: 2012,
//     author: 'Sandi Metz',
//     id: "afa5de02-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring', 'design']
//   },
//   {
//     title: 'Crime and punishment',
//     published: 1866,
//     author: 'Fyodor Dostoevsky',
//     id: "afa5de03-344d-11e9-a414-719c6709cf3e",
//     genres: ['classic', 'crime']
//   },
//   {
//     title: 'The Demon ',
//     published: 1872,
//     author: 'Fyodor Dostoevsky',
//     id: "afa5de04-344d-11e9-a414-719c6709cf3e",
//     genres: ['classic', 'revolution']
//   },
// ]

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
      author: String
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
    // authorCount: () => authors.length,
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if(args.genre && args.author){
        // return books.filter(b => (args.author === b.author && b.genres.includes(args.genre)))
        return Book.find({author: args.author, genres: args.genre})
      }
      else if(args.author){
        // return books.filter(b => (args.author === b.author))
        return Book.find({author: args.author})
      }
      else if(args.genres){
        // return books.filter(b => (b.genres.includes(args.genre)))
        return Book.find({genres: args.genre})
      }
    //return books
    return Book.find({}) 
    },
    // allAuthors: () => authors
    allAuthors: (root, args) =>  Author.find({})
  },

  Author: {
    bookCount: (root) => {
      // const authorBooks = books.filter(b => b.author === root.name)
      const authorBooks = Book.find({author: root.name})
      //return authorBooks.length
      return "1"
    }
  },

  Books: {
    author: async (root) =>  {
      
      //const bookAuthor = authors.filter(a => a.name === root.author)
      const bookAuthor = await Author.find({name: root.author}) 
      console.log("BooksQueryAuthor", bookAuthor);
      const currentAuthor = bookAuthor[0]
      
      return {
        ...currentAuthor
      }
    }
  },

  Mutation:{
    addBook: async (root, { title, author, published, genres }) => {
      //const book = {...args, id: uuid()}
      
      //books = books.concat(book)
      // const foundAuthor = authors.find(a => a.name === args.author)
      let foundAuthor = await Author.findOne({name: author})


      if(!foundAuthor){
          console.log("Not found triggered");
      //     //const author = {name:args.author , id: uuid()}
      //     authors = authors.concat(author)
      //     console.log("author", author)
          foundAuthor = new Author({name: args.author})
          await author.save()
        }

      let book = new Book({ title, author: foundAuthor, published, genres })
      // console.log("found?", foundAuthor)
      //return book

      try {
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: { title, author, published, genres },
        })
      }

      book = await Book.findById(book.id)

      return book
    },

    editAuthor: (root, args) => {
      const author = authors.find(a => a.name === args.name)
      if(!author){
        return null
      }

      const updatedAuthor = {...author, born: args.setBornTo}

      authors = authors.map(a => a.name === args.name ? updatedAuthor : a)
      return updatedAuthor
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