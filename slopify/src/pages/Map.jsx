import { 
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from 'react-leaflet'

import "./map.css"

import { format, parse } from 'date-fns';
import useEvents from '../hooks/useEvents';

function Map() {
    const sion_position = [46.2331, 7.3606];
    const { events, loading, error } = useEvents()
    const date_format = 'dd.MM.yyyy'
  
    if(loading) return <p>Loading events...</p>

    if(error) return <p>Can't read data...</p>

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
                        <span>{format(parse(e.dateFrom, 'yyyyMMdd', new Date()), date_format)} - {format(parse(e.dateTo, 'yyyyMMdd', new Date()), date_format)}</span><br/>
                        <span>{e.artists.map(artist => artist.name).join(', ')}</span>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

export default Map;
