import useEvents from "../hooks/useEvents"
import { format, parse } from 'date-fns';

function Events() {
  const { events, loading, error } = useEvents()
  const date_format = 'dd.MM.yyyy'

  if(loading) return <p>Loading events...</p>

  if(error) return <p>Can't read data...</p>
  
  return (
    <div>
      <h1>Events</h1>

      {events.map((e) => (
        <div key={e.name}>
          <h3>{e.name}</h3>
          <span>{format(parse(e.dateFrom, 'yyyyMMdd', new Date()), date_format)} - {format(parse(e.dateTo, 'yyyyMMdd', new Date()), date_format)}</span><br/>
          <span>{e.artists.map(artist => artist.name).join(', ')}</span>
        </div>
      ))}
    </div>
  )
}

export default Events