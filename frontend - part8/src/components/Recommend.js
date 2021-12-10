import React, { useState, useEffect } from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { ALL_BOOKS, USER_GENRE } from '../queries'
import { shouldCanonizeResults } from '@apollo/client/cache/inmemory/helpers'

//Could make this more efficient to just update the "Books.js" view

const Recommend = (props) => {
  const [genre, setGenre] = useState(null)
  const [getBooks, result] = useLazyQuery(ALL_BOOKS)
  const [books, setBooks] = useState(null)

  const userGenre = useQuery(USER_GENRE)

  useEffect(() => {
    if(genre){
      getBooks({variables: {genre}})
    }
  }, [genre])

  useEffect(() => {
    console.log(genre);
    if (result.data) {
      setBooks(result.data.allBooks)
      console.log(result.data.allBooks);
    }
  }, [result])

  if (!props.show) {
    return null
  }

  if (userGenre.loading) {
    return <div>loading...</div>
  }
  else if(!genre) {
    setGenre(userGenre.data.me.favoriteGenre)
  }
  
  return (
    <div>
      <h2>Recommendations</h2>

      <table>
        <thead>
          <tr>
            <th>
              Books in your favorite genre {genre}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {
            !books ? 
            null :
            books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
            )
          }
        </tbody>
      </table>
    </div>
  )
}

export default Recommend