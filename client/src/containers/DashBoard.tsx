import ErrorBoundry from "components/ErrorBoundry";
import GoogleMapsTile from "components/GoogleMapsTile";

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
    </>
  );
};

export default DashBoard;
