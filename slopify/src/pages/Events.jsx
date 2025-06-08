import { format, parse } from 'date-fns';
import { gql, useQuery } from "@apollo/client";
import { Box, Card, CardContent, Icon, Typography } from '@mui/material';
import EventCard from "./EventCard";
import { GET_PUBLIC_EVENTS } from "../graphql/queries";


function Events() {
  const { data, loading, error, refetch } = useQuery(GET_PUBLIC_EVENTS)
  const date_format = 'dd.MM.yyyy'

  if(loading) return <p>Loading events...</p>

  if(error) return <p>Can't read data...</p>

  refetch()
  const events = data?.publicEvents
  
  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', margin: '10px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <Typography variant="h3">Events</Typography>
      </Box>
      {events.map((e) => (
          <EventCard
              key={e._id}
              event={e}
              dateFormat={date_format}
          />
      ))}
  </Box>
  )
}

export default Events