import { gql } from '@apollo/client'

export const USER_GENRE = gql`
    query {
        me {
        favoriteGenre
        }
    }
`


export const ALL_AUTHORS = gql`
    query {
        allAuthors {
        name 
        born 
        bookCount
        }
    }
`

export const ALL_BOOKS = gql`
    query ($author: String, $genre: String) {
      allBooks(author: $author, genre: $genre){
            title
            author{
                name
            }
            genres
            published
        }
    }
`

export const ADD_BOOK = gql`
    mutation addBook($title: String!, $published: Int, $author: String!, $genres: [String]) {
        addBook(
            title: $title, 
            published: $published, 
            author: $author, 
            genres: $genres
        ) {
            title
            published
            author{
                name
            }
            id
            genres
        }
  }
`

export const ADD_BORN = gql`
  mutation EditAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      id
      born
      bookCount
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`