import { useActor } from "@xstate/react";
import React from "react";
import { Service } from "../Service";

export const ServiceInCart = ({ service }) => {
  // thanks to useActor, we can send events to the service machine
  const [state, send] = useActor(service.ref);
  const onDeleteService = () => {
    send("DELETE");
  };
  return (
    <Service
      service={service}
      onActionclick={onDeleteService}
      actionText="Supprimer"
    />
  );
};
