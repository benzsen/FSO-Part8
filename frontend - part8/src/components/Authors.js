  
import React, {useState} from 'react'
import { useMutation, useQuery } from '@apollo/client'

import { ALL_AUTHORS, ADD_BORN } from '../queries'

const Authors = (props) => {
  const [name, setName] = useState("")
  const [born, setBorn] = useState("")
  const [addBorn] = useMutation(ADD_BORN, {
    refetchQueries: [ { query: ALL_AUTHORS } ]
  })

  const result = useQuery(ALL_AUTHORS)
  console.log("result", result);

  if (!props.show) {
    return null
  }
   
  if (result.loading)  {
    return <div>loading...</div>
  }

  const authors= result.data.allAuthors

  const submit = async (event) => {
    event.preventDefault()
    console.log(name,born);
    addBorn({variables:{name, setBornTo: Number(born)}})
    
    setName('')
    setBorn('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <h3>Set Birth Year</h3>
      <div>
      <form onSubmit={submit} >
        <select onChange={({ target }) => setName(target.value)}>
          {authors.map( (a, idx) => <option value={a.name} key={idx}>{a.name}</option>)}
        </select>
        <div>
          born 
          <input
            type='number'
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type='submit'>Update Author</button>
      </form>
      </div>
    </div>
  )
}

export default Authors
