import { assign, Machine } from "xstate";
import { escalate } from "xstate/lib/actions";

const AUTH_STATES = {
  EDITING: "editing",
  LOG_IN: "logIn",
  LOGGED_IN: "loggedIn",
  CANCEL: "cancel"
};

export const authMachine = Machine(
  {
    // ID that we see in the inspector
    id: "auth",

    // the machine starts at this state
    initial: AUTH_STATES.EDITING,

    // Default machine context
    context: {
      name: "", // user's name
      isLoggedIn: false, // user is logged in
      error: null // error
    },

    // Define states
    states: {
      [AUTH_STATES.EDITING]: {
        initial: "idle",
        states: {
          // Nothing happened yet
          idle: {},

          // In this state when an error occured
          error: {}
        },
        on: {
          "AUTH.LOG_IN": [
            {
              // Goes to AUTH_STATES.LOG_IN only if the condition is true
              // The function is in the guards object below
              cond: "userNameIsNotEmpty",
              target: AUTH_STATES.LOG_IN,
              actions: ["saveUsername"]
            },
            {
              // The user name is empty, go to the .error state
              target: `${AUTH_STATES.EDITING}.error`,
              actions: ["handleUserNameIsEmptyError"]
            }
          ],
          "AUTH.CANCEL": AUTH_STATES.CANCEL
        }
      },
      [AUTH_STATES.LOG_IN]: {
        after: {
          // after 2000 milliseconds, change machine's state
          2000: AUTH_STATES.LOGGED_IN
        },
        // the functions/actions are called upon exiting the current state
        exit: ["logLoggedIn"]
      },
      [AUTH_STATES.LOGGED_IN]: {
        // this action is called when entering this state
        entry: "setIsLoggedIn",

        // The parent machine calls onDone when this child machine hits its final state
        type: "final",

        // data sent to its parent
        data: {
          userName: (context) => context.name
        }
      },
      [AUTH_STATES.CANCEL]: {
        // escalate triggers onError from parent
        entry: escalate("CANCEL_AUTH")
      }
    }
  },
  {
    actions: {
      // Save the user's name
      saveUsername: assign({
        name: (context, event) => event.name || context.name
      }),

      // Set isLoggedIn to true in the context
      setIsLoggedIn: assign({
        isLoggedIn: (_) => true
      }),

      // Save the error in the context
      handleUserNameIsEmptyError: assign({
        error: (_) => "USERNAME.EMPTY"
      }),

      // simple log
      logLoggedIn: (context) => {
        console.log(`${context.name} successfully connected`);
      }
    },
    guards: {
      // Guards on called with cond: guardName
      // They allows to have a complex flow when transition between states
      userNameIsNotEmpty: (_, event) => !!event.name
    }
  }
);
