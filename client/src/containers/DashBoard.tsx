import ErrorBoundry from "components/ErrorBoundry";
import EventLog from "components/EventLog";
import GoogleMapsTile from "components/GoogleMapsTile";
import RetentionTable from "components/RetentionTable";
import SessionsByDay from "components/SessionsByDay";
import SessionsByHours from "components/SessionsByHours";
import styled from "styled-components";
import React from "react";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const DashBoard: React.FC = () => {
  return (
    <DashBoardContainer>
      <ErrorBoundry>
        <GoogleMapsTile />
      </ErrorBoundry>
      <ErrorBoundry>
        <SessionsByDay />
      </ErrorBoundry>
      <ErrorBoundry>
        <SessionsByHours />
      </ErrorBoundry>
      <ErrorBoundry>
        <RetentionTable />
      </ErrorBoundry>
      <ErrorBoundry>
        <EventLog />
      </ErrorBoundry>
    </DashBoardContainer>
  );
};

export default DashBoard;
const DashBoardContainer = styled.div`
  display: "flex";
  flex-wrap: "wrap";
`;
