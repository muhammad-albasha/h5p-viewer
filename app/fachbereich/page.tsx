'use client'
import React from 'react'
import { useParams } from 'next/navigation'
import Fach from './[name]/page'

const Fachbereich = () => {
  const params = useParams();
  const name = params.name;

  return (
    <div>
      <h1>Fachbereich</h1>
      <Fach params={{ name: name as string }} />
    </div>
  )
}

export default Fachbereich