import React from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_BOOK_GENRE } from '../queries'
import { shouldCanonizeResults } from '@apollo/client/cache/inmemory/helpers'

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)
  //const allGenres = useQuery(ALL_BOOK_GENRE)
  let genres = []


  if (!props.show) {
    return null
  }

  if (result.loading)  {
    return <div>loading...</div>
  }

  const books = result.data.allBooks
  let filteredBooks = result.data.allBooks

  books.map(b => 
    b.genres.forEach(e => {
      if(!genres.includes(e)){
      genres = genres.concat(e)
      }
    })
  )

  const filterGenre = (genre) => {
    //filterBooks = books.filter(b => )
  }

  console.log(books)
  
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
          {filteredBooks.map(a =>
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
          <button key={g} onClick={()=>filterGenre()}>{g}</button>
          //onclick trigger function to filter books(Query with parameters)
        )}          
      </div>
    </div>
  )
}

export default Books