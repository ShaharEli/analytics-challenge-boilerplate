import ErrorBoundry from "components/ErrorBoundry";
import GoogleMapsTile from "components/GoogleMapsTile";
import RetentionTable from "components/RetentionTable";
import SessionsByDay from "components/SessionsByDay";
import SessionsByHours from "components/SessionsByHours";

import React from "react";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const DashBoard: React.FC = () => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
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
    </div>
  );
};

export default DashBoard;
