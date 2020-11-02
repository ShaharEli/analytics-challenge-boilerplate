import ErrorBoundry from "components/ErrorBoundry";
import GoogleMapsTile from "components/GoogleMapsTile";
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
    <>
      <ErrorBoundry>
        <GoogleMapsTile />
      </ErrorBoundry>
      <ErrorBoundry>
        <SessionsByDay />
      </ErrorBoundry>
      <ErrorBoundry>
        <SessionsByHours />
      </ErrorBoundry>
    </>
  );
};

export default DashBoard;
