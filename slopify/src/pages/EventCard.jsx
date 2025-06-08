import { Box, Card, CardContent, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { format, parse } from "date-fns";

function EventCard({ event, dateFormat, onDelete, onEdit }) {
    return (
        <Card sx={{ marginBottom: "15px" }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <CardContent>
                    <Typography variant='h6' component='h3'>
                        {event.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        <Typography variant='subtitle2' component='strong'>
                            Dates:
                        </Typography>{" "}
                        {format(parse(event.dateFrom, "yyyyMMdd", new Date()), dateFormat)}{" "}
                        -{" "}
                        {format(parse(event.dateTo, "yyyyMMdd", new Date()), dateFormat)}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        <Typography variant='subtitle2' component='strong'>
                            Artists:
                        </Typography>{" "}
                        {event.artists.map((artist) => artist.name).join(", ")}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        <Typography variant='subtitle2' component='strong'>
                            Location:
                        </Typography>{" "}
                        {event.location.lon}, {event.location.lat}
                    </Typography>
                </CardContent>
                <Box>
                    {onEdit && (
                        <IconButton aria-label='edit' onClick={() => onEdit(event._id)}>
                            <EditIcon />
                        </IconButton>
                    )}
                    {onDelete && (
                        <IconButton aria-label='delete' onClick={() => onDelete(event._id)}>
                            <DeleteIcon />
                        </IconButton>
                    )}
                </Box>
            </Box>
        </Card>
    );
}

export default EventCard;