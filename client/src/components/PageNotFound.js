import React from 'react'
import { Link } from 'react-router-dom'

function PageNotFound() {
  return (
    <div className='pageNotFound'>
        <h1>Page Not Found</h1>
        <h3>Go To Home Page: </h3> 
        <Link to="/postings"> Click Here</Link>
        
    </div>
  )
}

export default PageNotFound