import { v4 } from "uuid";
import {
  Machine, // Create a machine
  assign, // mutates machine context
  spawn, // spawn a new actor
  send, // send an event within the machine
  actions // a set af actions
} from "xstate";
import { authMachine } from "./authMachine";
import { createServiceMachine } from "./serviceMachine";

const {
  choose // allows to trigger functions/actions conditionally
} = actions;

/**
 * Every states the booking machine can be in
 */
export const BOOKING_STATES = {
  IDLE: "idle",
  SELECTING_DATE: "selectingDate",
  AUTHENTICATION: "authentication",
  CREDIT_CARD: "creditCard",
  CAN_SUBMIT: "canSubmit",
  CONFIRMING: "confirming",
  CONFIRMED: "confirmed"
};

/**
 * Create a new service object (the new actor is created here)
 * @param {name} service
 * @param {boolean} needOnlinePayment
 */
const createService = ({ name, needOnlinePayment }) => {
  const id = v4();
  return {
    id,
    name,
    needOnlinePayment,
    // spawn a new actor
    ref: spawn(createServiceMachine(id, name))
  };
};

/**
 * Create an appointment
 * @param {*} data data to send to the server
 * @param {boolean} success decide whether the response is a success or not (for test purposes)
 */
const createAppointment = (data, success) => {
  return new Promise((resolve, reject) => {
    console.log("data sent : ", data);

    // sends a response after 2000 milliseconds
    setInterval(() => {
      if (success) resolve("Success 👍");

      reject("Error 😱");
    }, 2000);
  });
};

/**
 * Configure a machine
 */
export const bookingMachine = Machine(
  {
    // ID that we see in the inspector
    id: "booking",

    // the machine starts at this state
    initial: BOOKING_STATES.IDLE,

    // Default machine context
    context: {
      services: [], // selected services
      selectedDate: null, // selected date
      userName: null, // user id,
      creditCard: null, // credit card numbers
      needOnlinePayment: false, // The user must enter his credit card information if it is true
      prevNeedOnlinePayment: false, // To know whether we must display/hide the credit card section when adding/removing a service
      error: null, // error
      willBeASuccess: true // the response from the server will be a successs (for test purposes)
    },

    // events that can be called in any state
    on: {
      "SERVICES.EMPTY": {
        // When there is no services selected, go back to this state
        target: BOOKING_STATES.IDLE
      },

      "BOOKING.ONLINE_PAYMENT": {
        // A credit card is needed before confirming the appointment
        target: BOOKING_STATES.CREDIT_CARD
      },

      "BOOKING.CAN_SUBMIT": {
        // A credit card is not needed anymore
        target: BOOKING_STATES.CAN_SUBMIT
      },

      "SERVICE.ADD": {
        actions: [
          // These functions/actions are in the actions object below

          "addService",
          "checkOnlinePaymentIsNeeded",
          "checkNeedOnlinePaymentBeforeConfirming"
        ]
      },

      "SERVICE.DELETE": {
        actions: [
          // These functions/actions are in the actions object below

          "deleteService",
          "checkOnlinePaymentIsNeeded",
          "checkNeedOnlinePaymentBeforeConfirming",
          "checkSelectedServicesLength"
        ]
      },

      "DATE.SELECTED": {
        actions: [
          // These functions/actions are in the actions object below

          "setSelectedDate"
        ]
      },

      "CREDIT_CARD.SELECT": {
        actions: [
          // These functions/actions are in the actions object below

          "setCreditCard"
        ]
      },

      "ERROR.CLEAN": {
        actions: [
          // These functions/actions are in the actions object below

          "cleanError"
        ]
      }
    },

    // Define states
    states: {
      [BOOKING_STATES.IDLE]: {
        on: {
          // Define events for this state
          "SERVICE.ADD": {
            // Next state after the actions are done
            target: BOOKING_STATES.SELECTING_DATE,
            actions: [
              // These functions/actions are in the actions object below
              // These actions are triggered during the transition from
              // BOOKING_STATES.SELECTING_SERVICES to BOOKING_STATES.SELECTING_DATE

              "addService",
              "checkOnlinePaymentIsNeeded"
            ]
          }
        }
      },
      [BOOKING_STATES.SELECTING_DATE]: {
        on: {
          // Define events for this state

          "DATE.SELECTED": {
            // Next state after the actions are done
            target: BOOKING_STATES.AUTHENTICATION,
            actions: [
              // These functions/actions are in the actions object below
              // These actions are triggered during the transition from
              // BOOKING_STATES.SELECTING_DATE to BOOKING_STATES.AUTHENTICATION

              "setSelectedDate"
            ]
          }
        }
      },
      [BOOKING_STATES.AUTHENTICATION]: {
        // invoke a child machine for the authentication
        invoke: {
          id: "auth", // the ID that we'll see in the inspector
          src: authMachine, // the machine that it calls
          data: {
            // override authMachine context here (optionnal)
            // if used, every data must be set

            name: "Batman", // He also needs a haircut sometimes
            isLoggedIn: false,
            error: null
          },
          onError: BOOKING_STATES.SELECTING_DATE,
          onDone: [
            // onDone is the same as a transition
            // The user successfully logged in
            {
              // this condition needs to be true to go to the specified target below
              // the function is in the guards object below
              cond: "onlinePaymentIsNeeded",
              // Next state is BOOKING_STATES.CREDIT_CARD if the user needs to pay online
              target: BOOKING_STATES.CREDIT_CARD,
              actions: ["setUsername"]
            },
            {
              // If the previous condition is false, the next state is BOOKING_STATES.CAN_SUBMIT
              target: BOOKING_STATES.CAN_SUBMIT,
              actions: ["setUsername"]
            }
          ]
        }
      },
      [BOOKING_STATES.CREDIT_CARD]: {
        on: {
          // Define events for this state

          "CREDIT_CARD.SELECT": {
            target: BOOKING_STATES.CAN_SUBMIT,
            actions: ["setCreditCard"]
          }
        }
      },
      [BOOKING_STATES.CAN_SUBMIT]: {
        initial: "idle",
        // These are sub-states
        // The SUBMIT event can be used in any sub-state
        states: {
          // here, nothing happened
          idle: {},

          // here, an error occured in the confirming state
          error: {}
        },
        on: {
          SUBMIT: {
            target: BOOKING_STATES.CONFIRMING,
            actions: ["setResult"]
          }
        }
      },
      [BOOKING_STATES.CONFIRMING]: {
        invoke: {
          id: "submit",
          src: (context) =>
            // call a function which returns a Promise and wait for the response
            createAppointment({ ...context }, context.willBeASuccess),

          // The promise resolves
          onDone: {
            target: BOOKING_STATES.CONFIRMED
          },

          // The promise rejects
          onError: {
            target: `${BOOKING_STATES.CAN_SUBMIT}.error`,
            actions: ["setError"]
          }
        }
      },
      [BOOKING_STATES.CONFIRMED]: {
        type: "final"
      }
    }
  },
  {
    // Define every actions
    actions: {
      // Add a new service
      addService: assign({
        services: (context, event) => {
          // Create a new service object with the actor within
          const newService = createService(event.service);
          const services = [...context.services];
          services.push(newService);

          return services;
        }
      }),

      // Delete a service
      deleteService: assign({
        services: (context, event) => {
          // filter only keeps services that have a different id than the deleted service's id
          return context.services.filter((service) => service.id !== event.id);
        }
      }),

      // Set the selected date into the context
      setSelectedDate: assign({
        selectedDate: (_, event) => event.selectedDate
      }),

      // Set the user name
      setUsername: assign({
        userName: (_, event) => event.data.userName
      }),

      // Set the credit card into the context
      setCreditCard: assign({
        creditCard: (_, event) => event.creditCard
      }),

      // Set the result from the server
      setResult: assign({
        willBeASuccess: (_, event) => event.isSuccessful
      }),

      // Set the error
      setError: assign({
        error: (_, event) => event.data
      }),

      // Set error to null
      cleanError: assign({
        error: (_) => null
      }),

      // Check if any service must be paid online
      // If any needs online payment, context.checkOnlinePaymentIsNeeded becomes true
      checkOnlinePaymentIsNeeded: assign({
        needOnlinePayment: (context) => {
          const { services } = context;
          return services.some((service) => service.needOnlinePayment);
        },
        prevNeedOnlinePayment: (context) => context.needOnlinePayment
      }),

      // * choose * allows to call functions conditionally
      // It is an array because it goes through all of its element
      // until a condition is true or until the end of the array
      checkSelectedServicesLength: choose([
        {
          cond: (context) => context.services.length <= 0,
          // actions called only if the condition above is true
          actions: ["resetMachine"]
        }
      ]),

      // this action is used when the user adds or removes a service
      checkNeedOnlinePaymentBeforeConfirming: choose([
        {
          // The user is about to confirm the appointment and adds a service
          // with online payment needed
          // and he didn't enter his credit card information yet
          cond: (context, _, { state }) =>
            state.matches(BOOKING_STATES.CAN_SUBMIT) &&
            context.prevNeedOnlinePayment !== context.needOnlinePayment &&
            context.needOnlinePayment,
          actions: ["addACreditCard"]
        },
        {
          // The user is about to enter his credit card information
          // but he removes the last service that needed online payment
          cond: (context, _, { state }) =>
            state.matches(BOOKING_STATES.CREDIT_CARD) &&
            context.prevNeedOnlinePayment !== context.needOnlinePayment &&
            !context.needOnlinePayment,
          actions: ["creditCardNotNeeded"]
        }
      ]),

      // Reset the machine to the very first state
      resetMachine: send("SERVICES.EMPTY"),

      // Go to state BOOKING_STATES.CREDIT_CARD because the user added a service
      // which needs a credit card
      addACreditCard: send("BOOKING.ONLINE_PAYMENT"),

      // Go to BOOKING_STATES.CAN_SUBMIT because there's no more creadit needed
      creditCardNotNeeded: send("BOOKING.CAN_SUBMIT")
    },
    guards: {
      // Guards on called with cond: guardName
      // They allow to have a complex flow when transition between states

      onlinePaymentIsNeeded: (context) => context.needOnlinePayment
    }
  }
);
