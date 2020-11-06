import React, { useEffect, useState } from "react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import styled from "styled-components";
import { Resizable } from "re-resizable";
import axios from "axios";
import { Loading } from "react-loading-wrapper";
import LoadingCanvas from "./LoadingCanvas";
import { Event } from "../models/event";
interface Pages {
  url: string;
  count: number;
}

export const PageViews = () => {
  const [events, setEvents] = useState<Pages[] | undefined>(undefined);
  const getFilteredViews = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3001/events/all-filtered?type=pageView`);
      const pageViewEvents: Event[] = data.events;
      if (pageViewEvents) {
        const pages: Pages[] = Array.from(
          new Set(pageViewEvents.map((event: Event) => event.url))
        ).map((url) => {
          return {
            url,
            count: 0,
          };
        });
        for (let i = 0; i < pageViewEvents.length; i++) {
          const index = pages.findIndex((page) => page.url === pageViewEvents[i].url);
          if (index !== -1) {
            pages[index].count++;
          }
        }
        setEvents(
          pages.map((page) => {
            return { ...page, url: page.url.split("3000/")[1] };
          })
        );
      }
    } catch (e) {}
  };
  useEffect(() => {
    getFilteredViews();
  }, []);
  return (
    <>
      <AnaliticTitle>page views</AnaliticTitle>

      <Resizable
        minWidth="200px"
        minHeight="200px"
        style={{ margin: "30px" }}
        defaultSize={{
          width: "90%",
          height: "33vh",
        }}
      >
        <Loading loadingComponent={<LoadingCanvas />} loading={!events}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={events}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="url" />
              <YAxis dataKey="count" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" barSize={40} fill="#4a5f8d" />
            </BarChart>
          </ResponsiveContainer>
        </Loading>
      </Resizable>
    </>
  );
};

const AnaliticTitle = styled.h2`
  margin-left: 20px;
`;
