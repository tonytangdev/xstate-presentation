import React from "react";
import { services } from "../../mocks/services";
import { Service } from "../Service";
import { ServiceInCart } from "../ServiceInCart";

import "./styles.css";

export const ServicesList = ({ selectedServices = [], onServiceAdd }) => {
  const onServiceAddClick = (service) => onServiceAdd(service);

  return (
    <div className="services-list-container">
      <div>
        <h3>
          <span role="img" aria-label="cart">
            🛒
          </span>{" "}
          Panier
        </h3>
        {selectedServices.map((selectedService) => (
          <ServiceInCart key={selectedService.id} service={selectedService} />
        ))}
        {selectedServices.length <= 0 && (
          <span>
            Rien dans le panier... Mais pas pour longtemps{" "}
            <span role="img" aria-label="money">
              💸
            </span>
          </span>
        )}
      </div>
      <div>
        <h3>✂ Ajouter des prestations</h3>
        {services.map((service) => (
          <Service
            key={service.name}
            service={service}
            onActionclick={onServiceAddClick}
            actionText="Ajouter"
          />
        ))}
      </div>
    </div>
  );
};
