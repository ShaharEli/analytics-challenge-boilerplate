import React, { useEffect, useState } from "react";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import styled from "styled-components";
import { Resizable } from "re-resizable";
import axios from "axios";
import { Loading } from "react-loading-wrapper";
import LoadingCanvas from "./LoadingCanvas";
import { Event } from "../models/event";
interface Os {
  os: string;
  count: number;
}
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "blue", "green"];
const RADIAN = Math.PI / 180;
export const OsChart = () => {
  const [events, setEvents] = useState<Os[] | undefined>(undefined);
  const getFilteredOs = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3001/events/all`);
      const allEvents: Event[] = data;
      if (allEvents) {
        const oss: Os[] = Array.from(new Set(allEvents.map((event: Event) => event.os))).map(
          (os) => {
            return {
              os,
              count: 0,
            };
          }
        );
        for (let i = 0; i < allEvents.length; i++) {
          const index = oss.findIndex((page) => page.os === allEvents[i].os);
          if (index !== -1) {
            oss[index].count++;
          }
        }
        console.log(oss);
        setEvents(
          oss.map((os) => {
            return { os: os.os, count: Math.round((os.count * 100) / allEvents.length) };
          })
        );
      }
    } catch (e) {}
  };
  useEffect(() => {
    getFilteredOs();
  }, []);
  let renderLabel = function ({ cx, cy, midAngle, innerRadius, outerRadius, count, index }: any) {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN) * 1.6;

    return (
      <text
        x={index === 1 || index === 4 ? x - 8 : x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${count}%`}
      </text>
    );
    return;
  };
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
            <PieChart>
              <Pie
                data={events}
                dataKey="count"
                nameKey="os"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={renderLabel}
                labelLine={false}
                fill="#8884d8"
              >
                {events?.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Loading>
      </Resizable>
    </>
  );
};

const AnaliticTitle = styled.h2`
  margin-left: 20px;
`;
