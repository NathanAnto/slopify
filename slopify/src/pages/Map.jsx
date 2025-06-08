import { 
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from 'react-leaflet'

import "./map.css"

import { format, parse } from 'date-fns';
import { gql, useQuery } from "@apollo/client";
import { GET_PUBLIC_EVENTS } from "../graphql/queries";

function Map() {
    const sion_position = [46.2331, 7.3606];  
    const { data, loading, error, refetch } = useQuery(GET_PUBLIC_EVENTS)
    const date_format = 'dd.MM.yyyy'
  
    if(loading) return <p>Loading events...</p>
  
    if(error) return <p>Can't read data...</p>

    refetch()
    const events = data?.publicEvents

    return (
        <MapContainer center={sion_position} zoom={3} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />

            {events.map((e, index) => (
                <Marker key={index} position={e.location}>
                    <Popup>
                        <h3>{e.name}</h3>
                        <span>
                            {format(parse(e.dateFrom, 'yyyyMMdd', new Date()), date_format)} - {format(parse(e.dateTo, 'yyyyMMdd', new Date()), date_format)}
                        </span>
                        <div>
                            {e.artists.map(artist => (
                                <a key={artist._id} href={artist.href} target="_blank" style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
                                    {artist.imageUrl && (
                                        <img 
                                            src={artist.imageUrl} 
                                            alt={artist.name} 
                                            style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '50%', marginRight: 8 }} 
                                        />
                                    )}
                                    <span>{artist.name}</span>
                                </a>
                            ))}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

export default Map;
