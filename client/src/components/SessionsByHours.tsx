import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Resizable } from "re-resizable";
import styled from "styled-components";
import { Event } from "../models/event";
import { Loading } from "react-loading-wrapper";
import axios from "axios";
import LoadingCanvas from "./LoadingCanvas";
import TextField from "@material-ui/core/TextField";
import { convertDateToString, getOffset, today } from "./dateHelpers";

interface HourSessions {
  hour: string;
  count: number;
}

const SessionsByHours = () => {
  const [sessions, setSessions] = useState<HourSessions[] | undefined>(undefined);
  const [offset, setOffset] = useState<number>(0);
  const getSessions = useCallback(async () => {
    const { data } = await axios.get(`http://localhost:3001/events/by-hours/${offset}`);
    setSessions(data);
  }, [offset]);

  useEffect(() => {
    getSessions();
  }, [offset]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setOffset(Math.floor(getOffset(event.target.value)));
  };

  return (
    <Resizable
      minWidth="200px"
      minHeight="200px"
      defaultSize={{
        width: "33vw",
        height: "33vh",
      }}
    >
      <Loading loadingComponent={<LoadingCanvas />} loading={!sessions}>
        <TextField
          id="datetime-local"
          label="Main"
          type="date"
          style={{ height: "50px", width: "100%" }}
          InputProps={{
            inputProps: { min: "2020-05-01", max: convertDateToString(today) },
          }}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <div style={{ height: "calc(100% - 50px)", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sessions} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <Line type="monotone" dataKey="count" stroke="#8884d8" name="This Day" />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Loading>
    </Resizable>
  );
};

export default SessionsByHours;
