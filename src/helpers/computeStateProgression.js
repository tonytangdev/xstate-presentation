/**
 * Compute an array containing the steps the machine has been in
 * @param {Object} state machine's actual state
 * @param {Object} machineStates object containing the machine's states ordered
 * @returns {Array} state progression
 *
 * @example
 * computeStateProgression({value: 'second'}, {FIRST_STEP: 'first', SECOND_STEP: 'second', THIRD_STEP: 'third'})
 * // returns ['first']
 *
 */
export const computeStateProgression = (state, machineStates) => {
  const statesList = Object.values(machineStates);
  const stateIndex = statesList.findIndex((x) => state.matches(x));

  const progression = statesList.slice(0, stateIndex);

  return progression;
};
