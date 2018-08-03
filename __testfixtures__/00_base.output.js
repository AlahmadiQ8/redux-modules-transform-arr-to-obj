const foo = () => {
  console.log('omg')
}

const { name, actions, reducer, constants, selector } = createModule({
  name: 'budget',
  initialState: fromJS({
    params: {
      size: 10000,
      page: 0,
      groupBy: DEFAULT_GROUPING,
    },
    _loading: false,
  }),
  selector: budgetModuleSelector,
  transformations: {
    groupByInit: {
      type: 'groupByInit',
      reducer: setParamsGroupByReducer,
    },

    FETCH: {
      type: 'FETCH',

      middleware: [
        middleware.propCheck({
          id: oneOfType([string, number]),
        }),
      ],

      reducer: (state, { payload: { id } }) => {
        return state.update(id, Map(), budget => budget.set('_loading', true))
      },
    },

    SET_AGGREGATES: {
      type: 'SET_AGGREGATES',

      middleware: [
        middleware.propCheck({
          id: oneOfType([string, number]).isRequired,
          aggregateData: object.isRequired,
        }),
      ],

      reducer: (state, { payload: { id, aggregateData } }) =>
        state.update(id, Map(), budget =>
          budget.set('aggregateData', fromJS(aggregateData))
        ),
    },

    FETCH_SUCCESS: {
      type: 'FETCH_SUCCESS',

      middleware: [
        middleware.propCheck({
          id: oneOfType([string, number]),
          data: shape({
            groups: object,
            page: object.isRequired,
            data: array.isRequired,
          }).isRequired,
        }),
      ],

      reducer: (state, { payload: { id, data } }) => {
        const groupedData = groupData(
          budgetGrouping,
          data.groups.group_order,
          data.data,
          data.groups.data
        )

        return state.update(id, Map(), budget =>
          budget
            .set('data', fromJS(data.data))
            .set('groups', fromJS(data.groups))
            .set('groupedData', fromJS(groupedData))
            .set('page', fromJS(data.page))
            .set('groupOrder', fromJS(data.groups.group_order))
            .set('_loading', false)
        )
      },
    },

    FETCH_ERROR: {
      type: 'FETCH_ERROR',

      middleware: [
        middleware.propCheck({
          error: object,
          id: oneOfType([string, number]).isRequired,
        }),
      ],

      reducer: (state, { payload: { error, id } }) => {
        return state.update(id, Map(), budget =>
          budget.set('_errors', error).set('_loading', false)
        )
      },
    },

    SET_PARAMS_CURRENT_PAGE: {
      type: 'SET_PARAMS_CURRENT_PAGE',

      reducer: (state, { payload }) =>
        state.update('params', params => params.set('page', payload)),
    },

    setParamsExpandAll: {
      type: 'setParamsExpandAll',
      reducer: setParamsExpandAllReducer,
    },

    expandAllInit: {
      type: 'expandAllInit',
      reducer: setParamsExpandAllReducer,
    },

    setParamsGroupBy: {
      type: 'setParamsGroupBy',
      reducer: setParamsGroupByReducer,
    },

    filterInit: {
      type: 'filterInit',
      middleware: [setParamsFilterPropCheck],
      reducer: setParamsFilterReducer,
    },

    setParamsFilter: {
      type: 'setParamsFilter',
      middleware: [setParamsFilterPropCheck],
      reducer: setParamsFilterReducer,
    },

    REMOVE_PARAMS_FILTER: {
      type: 'REMOVE_PARAMS_FILTER',

      middleware: [
        middleware.propCheck({
          filter: shape({
            name: string.isRequired,
          }),
        }),
      ],

      reducer: (state, { payload: { filter } }) =>
        state.update('params', Map(), params =>
          setPage(params.deleteIn(['filters', filter.name]), 0)
        ),
    },

    RESET_PARAMS_FILTER: {
      type: 'RESET_PARAMS_FILTER',
      reducer: resetParamsFilterReducer,
    },

    RESET_PARAMS_FILTER_FOR_SAVE: {
      type: 'RESET_PARAMS_FILTER_FOR_SAVE',
      reducer: resetParamsFilterReducer,
    },

    SET_INITIAL_PARAMS: {
      type: 'SET_INITIAL_PARAMS',

      reducer: (state, { payload }) => {
        return state.set('params', fromJS(payload))
      },
    },
  },
})
