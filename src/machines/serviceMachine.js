import { createMachine, sendParent } from "xstate";

/**
 * Every states the service machine can be in
 */
const SERVICES_STATES = {
  IDLE: "idle",
  DELETED: "deleted"
};

/**
 * Create a new service machine
 * @param id service id
 * @param name serice name
 */
export const createServiceMachine = (id, name) =>
  createMachine(
    {
      // ID that we see in the inspector
      id: "service",

      // the machine starts at this state
      initial: SERVICES_STATES.IDLE,

      // Default machine context
      context: {
        name,
        id
      },

      // Define states
      states: {
        [SERVICES_STATES.IDLE]: {
          on: {
            DELETE: {
              target: SERVICES_STATES.DELETED
            }
          }
        },
        [SERVICES_STATES.DELETED]: {
          // call a function when the machine enters this state
          onEntry: "deleteService"
        }
      }
    },
    {
      actions: {
        // Send an event to its parent
        deleteService: sendParent((context) => ({
          type: "SERVICE.DELETE",
          id: context.id
        }))
      }
    }
  );
