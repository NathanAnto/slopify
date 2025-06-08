import { format, parse } from 'date-fns';
import { gql, useQuery } from "@apollo/client";
import { Box, Card, CardContent, Icon, Typography } from '@mui/material';

const GET_EVENTS = gql`
    query {
        publicEvents {
            _id
            name
            dateFrom
            dateTo
            artists {
                _id
                name
                href
                imageUrl
            }
            location
        }
    }
`;


function Events() {
  const { data, loading, error } = useQuery(GET_EVENTS)
  const date_format = 'dd.MM.yyyy'

  if(loading) return <p>Loading events...</p>

  if(error) return <p>Can't read data...</p>

  const events = data?.publicEvents
  
  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', margin: '10px' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
      <Typography variant="h3">Events</Typography>
    </Box>

    {events.map((e) => (
      <Card key={e._id} sx={{ marginBottom: '15px' }}>
        <CardContent>
          <Typography variant="h6" component="h3">{e.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            <Typography variant="subtitle2" component="strong">Dates:</Typography> {format(parse(e.dateFrom, 'yyyyMMdd', new Date()), date_format)} - {format(parse(e.dateTo, 'yyyyMMdd', new Date()), date_format)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Typography variant="subtitle2" component="strong">Artists:</Typography> {e.artists.map(artist => artist.name).join(', ')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Typography variant="subtitle2" component="strong">Location:</Typography> {e.location}
          </Typography>
        </CardContent>
      </Card>
    ))}
  </Box>
  )
}

export default Events