import { useContext, useEffect, useState } from "react";
import { format, parse } from "date-fns";
import UserContext from "../UserContext";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
    createSvgIcon,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const GET_EVENTS = gql`
    query {
        events {
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

const SEARCH_ARTIST = gql`
    query SearchArtist($name: String!) {
        searchArtist(name: $name) {
            _id
            href
            imageUrl
            name
        }
    }
`;

const CREATE_EVENT = gql`
    mutation CreateEvent(
        $name: String!
        $dateFrom: String!
        $dateTo: String!
        $artists: [JSON]!
        $location: [Float]
    ) {
        createEvent(
            name: $name
            dateFrom: $dateFrom
            dateTo: $dateTo
            artists: $artists
            location: $location
        ) {
            _id
            artists {
                _id
                name
                href
                imageUrl
            }
            createdBy
            dateFrom
            dateTo
            location
            name
        }
    }
`;

const DELETE_EVENT = gql`
    mutation DeleteEvent($eventId: String!) {
        deleteEvent(eventId: $eventId)
    }
`;

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

    const {
        data: suggestionData
    } = useQuery(SEARCH_ARTIST, {
        variables: { name: artistInput },
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
        console.log(formData);
        console.log("Selected artists:", selectedArtists);
        createEventMutation({
            variables: {
                name: formData.get("name"),
                dateFrom: format(startDate, "yyyyMMdd"),
                dateTo: format(endDate, "yyyyMMdd"),
                artists: selectedArtists,
                location: [
                    parseFloat(formData.get("latitude")),
                    parseFloat(formData.get("longitude")),
                ],
                // createdBy: me.id,
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

    if (loading) return <p>Loading events...</p>;
    if (error) return <p>Can't read data...</p>;
    const events = data?.events;

    // if (suggLoading) return <p>Loading artists...</p>;
    // if (suggError) return <p>Can't read artists data...</p>;
    const suggestedArtists = suggestionData?.searchArtist || [];

    return (
        <Box
            sx={{
                border: "1px solid #ccc",
                borderRadius: "5px",
                padding: "10px",
                margin: "10px",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                }}
            >
                <Typography variant='h3'>My Events</Typography>
                <IconButton
                    variant='contained'
                    color='primary'
                    onClick={handleDialogOpen}
                >
                    <PlusIcon />
                </IconButton>
            </Box>
            <Dialog
                open={open}
                maxWidth='md'
                fullWidth='true'
                slotProps={{
                    paper: {
                        component: "form",
                        onSubmit: (event) => handleCreateEvent(event),
                    },
                }}
            >
                <DialogTitle>New event</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        required
                        margin='dense'
                        id='name'
                        name='name'
                        label='Event name'
                        type='text'
                        fullWidth
                        variant='outlined'
                    />

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            sx={{ mt: "8px", mb: "4px" }}
                            label='Start date'
                            value={startDate}
                            format='dd.MM.yyyy'
                            onChange={(newValue) => {
                                setStartDate(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                    <br />

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            sx={{ mt: "8px", mb: "4px" }}
                            label='End date'
                            value={endDate}
                            format='dd.MM.yyyy'
                            onChange={(newValue) => {
                                setEndDate(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                    <br />
                    
                    <Autocomplete
                        freeSolo
                        options={suggestedArtists.filter(
                            (option) => !selectedArtists.some((a) => a._id === option._id)
                        )}
                        getOptionLabel={(option) => option.name || ""}
                        inputValue={artistInput}
                        onInputChange={(_, newInputValue) => setArtistInput(newInputValue)}
                        onChange={(_, value) => {
                            if (value && value._id) {
                                setArtistInput(value.name);
                            } else {
                                setArtistInput(value || "");
                            }
                        }}
                        renderOption={(props, option) => (
                            <li {...props} key={option._id} style={{ display: "flex", alignItems: "center" }}>
                                {option.imageUrl && (
                                    <img
                                        src={option.imageUrl}
                                        alt={option.name}
                                        style={{ width: 32, height: 32, marginRight: 8, borderRadius: "50%" }}
                                    />
                                )}
                                <span>{option.name}</span>
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Rechercher un artiste"
                                margin="dense"
                                variant="outlined"
                                fullWidth
                            />
                        )}
                    />
                    <Button
                        sx={{ mt: 1, mb: 1 }}
                        variant="outlined"
                        onClick={handleAddArtist}
                        disabled={!artistInput.trim()}
                    >
                        Ajouter un artiste
                    </Button>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                        {selectedArtists.map((artist) => (
                            <Chip
                                key={artist.name}
                                label={artist.name}
                                onDelete={() => handleRemoveArtist(artist)}
                            />
                        ))}
                    </Box>

                    <TextField
                        autoFocus
                        required
                        margin='dense'
                        id='latitude'
                        name='latitude'
                        label='Latitude'
                        type='text'
                        variant='outlined'
                    />
                    <br />

                    <TextField
                        autoFocus
                        required
                        margin='dense'
                        id='longitude'
                        name='longitude'
                        label='Longitude'
                        type='text'
                        variant='outlined'
                    />
                </DialogContent>
                <DialogActions>
                    <Button type='submit' variant='contained'>
                        Create
                    </Button>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {events.map((e) => (
                <Card key={e._id} sx={{ marginBottom: "15px" }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <CardContent>
                            <Typography variant='h6' component='h3'>
                                {e.name}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                <Typography
                                    variant='subtitle2'
                                    component='strong'
                                >
                                    Dates:
                                </Typography>{" "}
                                {format(
                                    parse(e.dateFrom, "yyyyMMdd", new Date()),
                                    date_format
                                )}{" "}
                                -{" "}
                                {format(
                                    parse(e.dateTo, "yyyyMMdd", new Date()),
                                    date_format
                                )}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                <Typography
                                    variant='subtitle2'
                                    component='strong'
                                >
                                    Artists:
                                </Typography>{" "}
                                {e.artists
                                    .map((artist) => artist.name)
                                    .join(", ")}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                <Typography
                                    variant='subtitle2'
                                    component='strong'
                                >
                                    Location:
                                </Typography>{" "}
                                {e.location[0]}, {e.location[1]}
                            </Typography>
                        </CardContent>
                        <IconButton
                            aria-label='delete'
                            onClick={() => handleDeleteEvent(e._id)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </Card>
            ))}
        </Box>
    );
}

export default MyEvents;
