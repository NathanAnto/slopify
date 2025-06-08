import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Autocomplete,
    Chip,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

function EventDialog({
    open,
    onClose,
    onSubmit,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    artistInput,
    setArtistInput,
    suggestedArtists,
    selectedArtists,
    handleAddArtist,
    handleRemoveArtist,
    suggestedLocations,
    locationInput,
    setLocationInput,
    selectedLocation,
    handleSelectLocation
}) {
    return (
        <Dialog
            open={open}
            maxWidth='md'
            fullWidth
            slotProps={{
                paper: {
                    component: "form",
                    onSubmit,
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
                        onChange={setStartDate}
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
                        onChange={setEndDate}
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

                <Autocomplete
                    options={suggestedLocations}
                    getOptionLabel={(option) => option.name || ""}
                    value={selectedLocation && selectedLocation._id ? selectedLocation : null}
                    inputValue={locationInput}
                    onInputChange={(_, newInputValue) => setLocationInput(newInputValue)}
                    onChange={handleSelectLocation}
                    renderOption={(props, option) => (
                        <li {...props} key={option._id} style={{ display: "flex", flexDirection: "column" }}>
                            <span>{option.name}</span>
                            <span style={{ fontSize: "0.8em", color: "#666" }}>
                                {option.address ? `${option.address.road || ""}, ${option.address.city || ""}` : ""}
                            </span>
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            required
                            label="Rechercher un lieu"
                            margin="dense"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                />
            </DialogContent>
            <DialogActions>
                <Button type='submit' variant='contained'>
                    Create
                </Button>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}

export default EventDialog;