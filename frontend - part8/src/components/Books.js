import React, {useState, useEffect} from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_BOOK_GENRE } from '../queries'
import { shouldCanonizeResults } from '@apollo/client/cache/inmemory/helpers'

const Books = (props) => {
  const [genre, setGenre] = useState("")
  const allResult = useQuery(ALL_BOOKS)
  const resultByGenre = useQuery(ALL_BOOKS, {
    variables: {genre}
  })
    
  if (!props.show) {
    return null
  }

  if (allResult.loading || resultByGenre.loading)  {
    return <div>loading...</div>
  }

  const books = resultByGenre.data.allBooks

  const filteredBooks = allResult.data.allBooks
  let genres = []
  
  filteredBooks.map(b => 
    b.genres.forEach(e => {
      if(!genres.includes(e)){
      genres = genres.concat(e)
      }
    })
  )
  
  return (
    <div>
      <h2>books</h2>

      <table>
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
      <div>
        {genres.map(g =>
          <button key={g} onClick={()=>setGenre(g)}>{g}</button>
          //onclick trigger function to filter books(Query with parameters)
        )}          
      </div>
    </div>
  )
}

export default Books