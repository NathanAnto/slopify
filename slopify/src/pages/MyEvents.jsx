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
            artists
            location
        }
    }
`;

const CREATE_EVENT = gql`
    mutation CreateEvent(
        $name: String!
        $dateFrom: String!
        $dateTo: String!
        $artists: [JSON]
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
            artists
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

    const { me, refetchMe, isLoading } = useContext(UserContext);
    const { data, loading, error, refetch } = useQuery(GET_EVENTS);
    const date_format = "dd.MM.yyyy";

    const [createEventMutation] = useMutation(CREATE_EVENT);

    const [deleteEventMutation] = useMutation(DELETE_EVENT);

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
        createEventMutation({
            variables: {
                name: formData.get("name"),
                dateFrom: format(startDate, "yyyyMMdd"),
                dateTo: format(endDate, "yyyyMMdd"),
                artists: formData
                    .get("artistes")
                    .split(",")
                    .map((artist) => ({
                        name: artist.trim(),
                    })),
                location: [
                    parseFloat(formData.get("latitude")),
                    parseFloat(formData.get("longitude")),
                ],
                createdBy: me.id,
            },
        }).then(() => {
            refetch(); // Refetch events after creating a new event
        });

        handleDialogClose();
    };

    const handleDeleteEvent = (eventId) => {
        deleteEventMutation({ variables: { eventId } }).then(() => {
            refetch(); // Refetch events after creating a new event
        });
    };

    if (loading) return <p>Loading events...</p>;

    if (error) return <p>Can't read data...</p>;

    const events = data?.events;

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

                    <TextField
                        autoFocus
                        required
                        margin='dense'
                        id='artistes'
                        name='artistes'
                        label='Artists'
                        type='text'
                        fullWidth
                        variant='outlined'
                    />
                    <br />

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
