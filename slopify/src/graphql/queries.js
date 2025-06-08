import { gql } from "@apollo/client";

export const GET_PUBLIC_EVENTS = gql`
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
            location {
                _id
                name
                lon
                lat
            }
        }
    }
`;

export const GET_EVENTS = gql`
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
            location {
                _id
                name
                lon
                lat
            }
        }
    }
`;

export const SEARCH_ARTIST = gql`
    query SearchArtist($name: String!) {
        searchArtist(name: $name) {
            _id
            href
            imageUrl
            name
        }
    }
`;

export const SEARCH_LOCATION = gql`
    query SearchLocation($name: String!) {
        searchLocation(name: $name) {
            _id
            name
            lon
            lat
        }
    }
`;

export const CREATE_EVENT = gql`
    mutation CreateEvent(
        $name: String!
        $dateFrom: String!
        $dateTo: String!
        $artists: [JSON]!
        $location: JSON
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
            location {
                _id
                name
                lon
                lat
            }
            name
        }
    }
`;

export const DELETE_EVENT = gql`
    mutation DeleteEvent($eventId: String!) {
        deleteEvent(eventId: $eventId)
    }
`;