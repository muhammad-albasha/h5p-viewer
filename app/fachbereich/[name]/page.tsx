import React from 'react'

const Fach = ({ params }: { params: { name: string } }) => {
  const { name } = params;
  
  return (
    <div>
        <h1>{name}</h1>
    </div>
  )
}

export default Fach