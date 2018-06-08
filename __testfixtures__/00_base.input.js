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
  transformations: [
    {
      type: 'groupByInit',
      reducer: setParamsGroupByReducer,
    },
    {
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
    {
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
    {
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
    {
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
    {
      type: 'SET_PARAMS_CURRENT_PAGE',
      reducer: (state, { payload }) =>
        state.update('params', params => params.set('page', payload)),
    },
    {
      type: 'setParamsExpandAll',
      reducer: setParamsExpandAllReducer,
    },
    {
      type: 'expandAllInit',
      reducer: setParamsExpandAllReducer,
    },
    {
      type: 'setParamsGroupBy',
      reducer: setParamsGroupByReducer,
    },
    {
      type: 'filterInit',
      middleware: [setParamsFilterPropCheck],
      reducer: setParamsFilterReducer,
    },
    {
      type: 'setParamsFilter',
      middleware: [setParamsFilterPropCheck],
      reducer: setParamsFilterReducer,
    },
    {
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
    {
      type: 'RESET_PARAMS_FILTER',
      reducer: resetParamsFilterReducer,
    },
    {
      type: 'RESET_PARAMS_FILTER_FOR_SAVE',
      reducer: resetParamsFilterReducer,
    },
    {
      type: 'SET_INITIAL_PARAMS',
      reducer: (state, { payload }) => {
        return state.set('params', fromJS(payload))
      },
    },
  ],
})
