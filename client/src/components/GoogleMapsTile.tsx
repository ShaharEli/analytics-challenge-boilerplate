import React, { useState, useCallback, useEffect, memo } from "react";
import { Resizable } from "re-resizable";
import { GoogleMap, LoadScript, Marker, InfoWindow, MarkerClusterer } from "@react-google-maps/api";
import axios from "axios";
import styled from "styled-components";
import { Event } from "../models/event";
import { Loading } from "react-loading-wrapper";
import LoadingCanvas from "./LoadingCanvas";

const apiKey = "AIzaSyA1jO5KCUbo5ifKHb4LK5ilBN2Fp0NZb5Y";
const GoogleMapsTile = () => {
  const [map, setMap] = useState<google.maps.Map | undefined>(undefined);
  const [events, setEvents] = useState<Event[] | undefined>(undefined);
  const [filter, setFilter] = useState<string>("signup");

  const getFilteredMap = useCallback(async () => {
    console.log("filtering", filter);
    const { data: filteredEvents } = await axios.get(
      `http://localhost:3001/events/all-filtered?type=${filter}`
    );
    setEvents(filteredEvents.events);
  }, [filter]);

  useEffect(() => {
    getFilteredMap();
  }, [filter]);

  const onUnmount = useCallback(() => {
    setMap(undefined);
  }, []);

  const onLoad = useCallback((map) => {
    const bounds = new window.google.maps.LatLngBounds();
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const center = {
    lat: 31.46667,
    lng: 34.783333,
  };
  const mapStyle = { height: `calc(100% - 50px)`, width: "100%" };
  return (
    <>
      <Resizable
        minWidth="200px"
        minHeight="200px"
        defaultSize={{
          width: "33vw",
          height: "33vh",
        }}
      >
        <Loading loadingComponent={<LoadingCanvas />} loading={!events}>
          <Select onChange={(e) => setFilter(e.target.value)}>
            <option value={"signup"}>signup</option>
            <option value={"admin"}>admin</option>
            <option value={"login"}>login</option>
            <option value={"/"}>/</option>
          </Select>
          <LoadScript googleMapsApiKey={apiKey} loadingElement={LoadingCanvas}>
            <GoogleMap
              mapContainerStyle={mapStyle}
              zoom={1}
              onLoad={onLoad}
              onUnmount={onUnmount}
              center={center}
              options={{
                streetViewControl: false,
                center: center,
                mapTypeControl: false,
                fullscreenControl: false,
                scaleControl: true,
              }}
            >
              {Array.isArray(events) && (
                // @ts-ignore
                <MarkerClusterer>
                  {(clusterer) =>
                    events.map((event) => (
                      <Marker
                        key={event._id}
                        position={event.geolocation.location}
                        clusterer={clusterer}
                        title={event.browser}
                      />
                    ))
                  }
                </MarkerClusterer>
              )}
            </GoogleMap>
          </LoadScript>
        </Loading>
      </Resizable>
    </>
  );
};

export default memo(GoogleMapsTile);

const Select = styled.select`
  background-color: #3f51b5;
  color: white;
  padding: 12px;
  height: 50px;
  border: none;
  font-size: 20px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  -webkit-appearance: button;
  appearance: button;
  outline: none;
  width: 100%;
`;
