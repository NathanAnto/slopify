import { useState } from "react";
import { format, parse } from "date-fns";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
    Box,
    IconButton,
    Typography,
    createSvgIcon,
} from "@mui/material";

import EventCard from "./EventCard";
import EventDialog from "./EventDialog";

import {
    GET_EVENTS,
    SEARCH_ARTIST,
    SEARCH_LOCATION,
    CREATE_EVENT,
    DELETE_EVENT,
} from "../graphql/queries";

const PlusIcon = createSvgIcon(
    <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        strokeWidth={1.5}
        stroke='currentColor'
        className='h-6 w-6'
    >
        <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M12 4.5v15m7.5-7.5h-15'
        />
    </svg>,
    "Plus"
);

function MyEvents() {
    const [open, setCreateOpen] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const { data, loading, error, refetch } = useQuery(GET_EVENTS);
    const date_format = "dd.MM.yyyy";

    const [createEventMutation] = useMutation(CREATE_EVENT);
    const [deleteEventMutation] = useMutation(DELETE_EVENT);

    const [artistInput, setArtistInput] = useState("");
    const [selectedArtists, setSelectedArtists] = useState([]);

    const [locationInput, setLocationInput] = useState("");
    const [selectedLocation, setSelectedLocation] = useState({});

    const {data: suggestionArtistData} = useQuery(SEARCH_ARTIST, {
        variables: { name: artistInput },
    });
    const {data: suggestionLocationData} = useQuery(SEARCH_LOCATION, {
        variables: { name: locationInput },
    });

    const handleDialogOpen = () => {
        setCreateOpen(true);
    };

    const handleDialogClose = () => {
        setCreateOpen(false);
    };

    const handleCreateEvent = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        createEventMutation({
            variables: {
                name: formData.get("name"),
                dateFrom: format(startDate, "yyyyMMdd"),
                dateTo: format(endDate, "yyyyMMdd"),
                artists: selectedArtists,
                location: selectedLocation,
            },
        }).then(() => {
            refetch(); // Refetch events after creating a new event
        });

        setSelectedArtists([]);
        handleDialogClose();
    };

    const handleDeleteEvent = (eventId) => {
        deleteEventMutation({ variables: { eventId } }).then(() => {
            refetch(); // Refetch events after creating a new event
        });
    };

    const handleAddArtist = () => {
        const trimmed = artistInput.trim();
        if (
            trimmed &&
            !selectedArtists.some((a) => a.name === trimmed)
        ) {
            // Try to find the artist object in suggestions
            const artistObj = suggestedArtists.find(a => a.name === trimmed);
            if (artistObj) {
                setSelectedArtists([...selectedArtists, artistObj]);
            } else {
                setSelectedArtists([...selectedArtists, { name: trimmed }]);
            }
            setArtistInput("");
        }
    };

    const handleRemoveArtist = (artistToRemove) => {
        setSelectedArtists(
            selectedArtists.filter((a) => a.name !== artistToRemove.name)
        );
    };

    const handleSelectLocation = (event, value) => {
        console.log("Selected location:", value);
        if (value && selectedLocation._id !== value._id) {
            setSelectedLocation(value);
            setLocationInput("");
        }
    };

    if (loading) return <p>Loading events...</p>;
    if (error) return <p>Can't read data...</p>;
    const events = data?.events;

    const suggestedArtists = suggestionArtistData?.searchArtist || [];
    const suggestedLocations = suggestionLocationData?.searchLocation || [];

    return (
        <Box sx={{ border: "1px solid #ccc", borderRadius: "5px", padding: "10px", margin: "10px" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <Typography variant='h3'>My Events</Typography>
                <IconButton variant='contained' color='primary' onClick={handleDialogOpen}>
                    <PlusIcon />
                </IconButton>
            </Box>
            <EventDialog
                open={open}
                onClose={handleDialogClose}
                onSubmit={handleCreateEvent}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                // Artist input and selection
                artistInput={artistInput}
                setArtistInput={setArtistInput}
                suggestedArtists={suggestedArtists}
                selectedArtists={selectedArtists}
                handleAddArtist={handleAddArtist}
                handleRemoveArtist={handleRemoveArtist}
                // Location input and selection
                locationInput={locationInput}
                setLocationInput={setLocationInput}
                suggestedLocations={suggestedLocations}
                selectedLocation={selectedLocation}
                handleSelectLocation={handleSelectLocation}
            />
            {events.length === 0 ? (
                <Typography>No events created</Typography>
            ) : (
                events.map((e) => (
                    <EventCard
                        key={e._id}
                        event={e}
                        dateFormat={date_format}
                        onDelete={handleDeleteEvent}
                        // onEdit={handleEditEvent} // if you add editing
                    />
                ))
            )}
        </Box>
    );
}

export default MyEvents;
