import React, { useState} from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { ALL_BOOKS, USER_GENRE } from '../queries'
import { shouldCanonizeResults } from '@apollo/client/cache/inmemory/helpers'

const Recommend = (props) => {
  const [genre, setGenre] = useState("")

  const userGenre = useQuery(USER_GENRE)

  const resultByGenre = useQuery(ALL_BOOKS, {
    variables: {genre}
  })
  
  if (!props.show) {
    return null
  }

  if (resultByGenre.loading) {
    return <div>loading...</div>
  }
  else if(genre===""){
    setGenre(userGenre.data.me.favoriteGenre)
    // console.log(userGenre.data.me.favoriteGenre);
  }

  const books = resultByGenre.data.allBooks
  
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
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommend